import {
  RAB_CATEGORIES,
  SATUAN_OPTIONS,
  DEFAULT_RAB_SETTINGS,
  generateRabFromTemplate,
  calcRabSummary,
  calcItemTotal,
  recalcVolumesFromDesign,
  getCategoryName,
  formatRupiah,
  formatNumber,
  createEmptyRab,
} from './data/rab.js';

export function renderRabView(state, handlers) {
  const { projects, selectedRabProject, searchQuery } = state;
  const q = searchQuery;

  const filtered = projects.filter((p) =>
    !q || p.name.toLowerCase().includes(q) || p.clientName.toLowerCase().includes(q)
  );

  if (!selectedRabProject) {
    return `
      <div class="page-header">
        <h2>RAB / Bill of Quantity</h2>
        <p>Rencana Anggaran Biaya terhubung langsung dengan proyek & data desain. Volume dihitung otomatis dari luas bangunan.</p>
      </div>
      ${filtered.length === 0 ? `
        <div class="empty-state">
          <div class="empty-icon">₹</div>
          <h3>Belum ada proyek</h3>
          <p>Buat proyek terlebih dahulu, lalu buat RAB dari template spesialisasi.</p>
          <button class="btn btn-primary" onclick="window.__newProject()">+ Proyek Baru</button>
        </div>
      ` : `
        <div class="card-grid">
          ${filtered.map((p) => {
            const summary = calcRabSummary(p.rab ?? createEmptyRab());
            const itemCount = p.rab?.items?.length ?? 0;
            const design = p.design ?? {};
            return `
              <div class="card rab-project-card" data-rab-project="${p.id}">
                <div class="card-icon">₹</div>
                <h3>${p.name}</h3>
                <p>${p.clientName} · ${design.luasBangunan ? design.luasBangunan + ' m²' : 'Luas belum diisi'}</p>
                <div class="rab-card-stats">
                  <span>${itemCount} item</span>
                  <span class="rab-total">${formatRupiah(summary.grandTotal)}</span>
                </div>
                ${p.budget ? `<div class="rab-variance ${summary.grandTotal > p.budget ? 'over' : 'under'}">
                  Anggaran klien: ${formatRupiah(p.budget)}
                </div>` : ''}
                <button class="btn btn-sm btn-primary" style="margin-top:12px">Buka RAB →</button>
              </div>`;
          }).join('')}
        </div>
      `}`;
  }

  const p = projects.find((pr) => pr.id === selectedRabProject);
  if (!p) return '';

  return renderRabEditor(p, handlers);
}

export function renderRabEditor(project, handlers) {
  const rab = project.rab ?? createEmptyRab();
  const summary = calcRabSummary(rab);
  const design = project.design ?? {};
  const settings = summary.settings;

  const groupedItems = {};
  RAB_CATEGORIES.forEach((c) => { groupedItems[c.id] = []; });
  rab.items.forEach((it) => {
    if (!groupedItems[it.category]) groupedItems[it.category] = [];
    groupedItems[it.category].push(it);
  });

  let tableHtml = '';
  let rowNo = 1;
  RAB_CATEGORIES.forEach((cat) => {
    const items = groupedItems[cat.id] ?? [];
    if (!items.length) return;
    tableHtml += `<tr class="rab-cat-row"><td colspan="8">${cat.name}</td></tr>`;
    items.forEach((it) => {
      const total = calcItemTotal(it);
      const autoTag = it.volumeFormula ? '<span class="rab-auto-tag" title="Volume otomatis dari desain">⚡</span>' : '';
      tableHtml += `
        <tr class="rab-item-row" data-item-id="${it.id}">
          <td class="rab-col-no">${rowNo++}</td>
          <td><select class="rab-input rab-cat-select" data-field="category" data-id="${it.id}">
            ${RAB_CATEGORIES.map((c) => `<option value="${c.id}" ${it.category === c.id ? 'selected' : ''}>${c.id}</option>`).join('')}
          </select></td>
          <td><input class="rab-input rab-pekerjaan" data-field="pekerjaan" data-id="${it.id}" value="${esc(it.pekerjaan)}" /></td>
          <td>${autoTag}<input type="number" class="rab-input rab-vol" data-field="volume" data-id="${it.id}" value="${it.volume ?? 0}" step="0.01" min="0" ${it.volumeFormula ? 'readonly title="Klik Recalculate untuk update dari desain"' : ''} /></td>
          <td><select class="rab-input" data-field="satuan" data-id="${it.id}">
            ${SATUAN_OPTIONS.map((s) => `<option ${it.satuan === s ? 'selected' : ''}>${s}</option>`).join('')}
          </select></td>
          <td><input type="number" class="rab-input rab-harga" data-field="hargaSatuan" data-id="${it.id}" value="${it.hargaSatuan ?? 0}" step="1000" min="0" /></td>
          <td class="rab-jumlah">${formatRupiah(total)}</td>
          <td><button class="btn btn-sm btn-danger rab-del-item" data-id="${it.id}">×</button></td>
        </tr>`;
    });
  });

  const catSummary = RAB_CATEGORIES.filter((c) => summary.byCategory[c.id] > 0).map((c) => `
    <div class="rab-cat-chip" style="border-color:${c.color}">
      <span>${c.id}</span>
      <strong>${formatRupiah(summary.byCategory[c.id])}</strong>
    </div>`).join('');

  const budgetDiff = project.budget ? summary.grandTotal - project.budget : null;

  return `
    <div class="page-header">
      <button class="btn btn-ghost btn-sm" id="btnBackRab" style="margin-bottom:12px">← Semua Proyek RAB</button>
      <h2>RAB: ${esc(project.name)}</h2>
      <p>${project.clientName} · Terhubung Tahap 4 (Gambar Kerja) & Tahap 5 (Pengadaan)</p>
    </div>

    <div class="rab-layout">
      <div class="rab-main">
        <!-- Design Panel -->
        <div class="detail-section rab-design-panel">
          <h3>Data Desain Proyek <span style="font-weight:400;color:var(--text-muted)">— sumber perhitungan volume otomatis</span></h3>
          <div class="rab-design-grid">
            <div class="form-group">
              <label>Luas Bangunan (m²)</label>
              <input type="number" id="designLuasBangunan" value="${design.luasBangunan ?? ''}" placeholder="120" min="0" step="0.1" />
            </div>
            <div class="form-group">
              <label>Luas Tapak (m²)</label>
              <input type="number" id="designLuasTapak" value="${design.luasTapak ?? ''}" placeholder="200" min="0" step="0.1" />
            </div>
            <div class="form-group">
              <label>Jumlah Lantai</label>
              <input type="number" id="designJumlahLantai" value="${design.jumlahLantai ?? 1}" min="1" max="50" />
            </div>
            <div class="form-group">
              <label>Tinggi Lantai (m)</label>
              <input type="number" id="designTinggiLantai" value="${design.tinggiLantai ?? 3}" min="2" step="0.1" />
            </div>
            <div class="form-group">
              <label>Tipe Struktur</label>
              <select id="designTipeStruktur">
                ${['beton bertulang', 'baja', 'kayu', 'batako', 'campuran'].map((t) =>
                  `<option ${design.tipeStruktur === t ? 'selected' : ''}>${t}</option>`).join('')}
              </select>
            </div>
            <div class="form-group" style="justify-content:flex-end">
              <button class="btn btn-primary btn-sm" id="btnSaveDesign">Simpan Desain</button>
            </div>
          </div>
        </div>

        <!-- Toolbar -->
        <div class="toolbar-row">
          <button class="btn btn-primary btn-sm" id="btnGenTemplate">⚡ Generate dari Template</button>
          <button class="btn btn-ghost btn-sm" id="btnRecalcVolume">↻ Hitung Ulang Volume</button>
          <button class="btn btn-ghost btn-sm" id="btnAddRabItem">+ Tambah Item</button>
          <button class="btn btn-ghost btn-sm" id="btnExportRabPdf">Export PDF</button>
          <button class="btn btn-ghost btn-sm" id="btnExportRabCsv">Export CSV</button>
          <button class="btn btn-ghost btn-sm" id="btnExportTender">Paket Pengadaan</button>
          <button class="btn btn-success btn-sm" id="btnSaveRab">Simpan RAB</button>
        </div>

        <!-- Table -->
        <div class="rab-table-wrap">
          <table class="rab-table">
            <thead>
              <tr>
                <th>No</th><th>Kat</th><th>Uraian Pekerjaan</th><th>Volume</th><th>Sat</th><th>Harga Satuan</th><th>Jumlah</th><th></th>
              </tr>
            </thead>
            <tbody id="rabTableBody">
              ${tableHtml || `<tr><td colspan="8" class="rab-empty">Belum ada item. Klik "Generate dari Template" untuk mulai cepat.</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Summary Sidebar -->
      <aside class="rab-sidebar">
        <div class="rab-summary-card">
          <h3>Ringkasan Biaya</h3>
          <div class="rab-summary-row"><span>Subtotal</span><span id="sumSubtotal">${formatRupiah(summary.subtotal)}</span></div>
          <div class="rab-summary-row"><span>Overhead (${settings.overheadPercent}%)</span><span id="sumOverhead">${formatRupiah(summary.overhead)}</span></div>
          <div class="rab-summary-row"><span>Profit (${settings.profitPercent}%)</span><span id="sumProfit">${formatRupiah(summary.profit)}</span></div>
          <div class="rab-summary-row"><span>Kontinjensi (${settings.contingencyPercent}%)</span><span id="sumContingency">${formatRupiah(summary.contingency)}</span></div>
          <div class="rab-summary-row"><span>PPN (${settings.ppnPercent}%)</span><span id="sumPpn">${formatRupiah(summary.ppn)}</span></div>
          <div class="rab-summary-grand"><span>TOTAL</span><span id="sumGrand">${formatRupiah(summary.grandTotal)}</span></div>

          ${project.budget ? `
            <div class="rab-budget-compare ${budgetDiff > 0 ? 'over-budget' : 'within-budget'}">
              <div>Anggaran Klien</div>
              <strong>${formatRupiah(project.budget)}</strong>
              <div style="margin-top:6px;font-size:12px">${budgetDiff > 0 ? '▲ Over' : '▼ Under'} ${formatRupiah(Math.abs(budgetDiff))}</div>
            </div>
          ` : ''}
          <label style="display:flex;align-items:center;gap:8px;margin-top:14px;font-size:12px;color:var(--text-secondary);cursor:pointer">
            <input type="checkbox" id="syncBudgetFromRab" checked style="accent-color:var(--accent)" />
            Sync anggaran proyek dari total RAB saat simpan
          </label>
        </div>

        <div class="rab-summary-card">
          <h3>Pengaturan RAB</h3>
          <div class="form-group"><label>Overhead (%)</label><input type="number" class="rab-setting" data-setting="overheadPercent" value="${settings.overheadPercent}" min="0" max="50" /></div>
          <div class="form-group"><label>Profit (%)</label><input type="number" class="rab-setting" data-setting="profitPercent" value="${settings.profitPercent}" min="0" max="50" /></div>
          <div class="form-group"><label>Kontinjensi (%)</label><input type="number" class="rab-setting" data-setting="contingencyPercent" value="${settings.contingencyPercent}" min="0" max="30" /></div>
          <div class="form-group"><label>PPN (%)</label><input type="number" class="rab-setting" data-setting="ppnPercent" value="${settings.ppnPercent}" min="0" max="30" /></div>
        </div>

        ${catSummary ? `<div class="rab-summary-card"><h3>Per Kategori</h3><div class="rab-cat-chips">${catSummary}</div></div>` : ''}

        <div class="highlight-box" style="font-size:12px">
          Item dengan ⚡ memiliki volume otomatis dari data desain. Ubah luas bangunan lalu klik <strong>Hitung Ulang Volume</strong>.
        </div>
      </aside>
    </div>`;
}

export function collectRabFromDom(project) {
  const rab = project.rab ?? createEmptyRab();
  const rows = document.querySelectorAll('.rab-item-row');
  const items = [];

  rows.forEach((row) => {
    const id = row.dataset.itemId;
    const existing = rab.items.find((it) => it.id === id) ?? {};
    const getVal = (field) => row.querySelector(`[data-field="${field}"]`)?.value;

    items.push({
      ...existing,
      id,
      category: getVal('category') ?? 'A',
      pekerjaan: getVal('pekerjaan') ?? '',
      volume: parseFloat(getVal('volume')) || 0,
      satuan: getVal('satuan') ?? 'm2',
      hargaSatuan: parseFloat(getVal('hargaSatuan')) || 0,
    });
  });

  const settings = { ...DEFAULT_RAB_SETTINGS, ...(rab.settings ?? {}) };
  document.querySelectorAll('.rab-setting').forEach((inp) => {
    settings[inp.dataset.setting] = parseFloat(inp.value) || 0;
  });

  return { items, settings, updatedAt: new Date().toISOString() };
}

export function collectDesignFromDom() {
  return {
    luasBangunan: parseFloat($('#designLuasBangunan')?.value) || null,
    luasTapak: parseFloat($('#designLuasTapak')?.value) || null,
    jumlahLantai: parseInt($('#designJumlahLantai')?.value, 10) || 1,
    tinggiLantai: parseFloat($('#designTinggiLantai')?.value) || 3,
    tipeStruktur: $('#designTipeStruktur')?.value ?? 'beton bertulang',
  };
}

function esc(s) {
  return String(s ?? '').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function $(sel) { return document.querySelector(sel); }

export {
  generateRabFromTemplate,
  calcRabSummary,
  recalcVolumesFromDesign,
  createEmptyRab,
  formatRupiah,
  formatNumber,
  getCategoryName,
  RAB_CATEGORIES,
};
