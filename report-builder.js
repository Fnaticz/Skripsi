const { TAHAPAN_DATA, SPESIALISASI_DATA } = require('./report-data');

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatCurrency(n) {
  if (!n) return '-';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
}

function formatDate(iso) {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

function getSpecLabel(id) {
  return SPESIALISASI_DATA.find((s) => s.id === id)?.title ?? id;
}

function getStageLabel(id) {
  return TAHAPAN_DATA.find((t) => t.id === id)?.title ?? `Tahap ${id}`;
}

const STATUS_LABELS = {
  locked: 'Terkunci',
  active: 'Berjalan',
  pending_approval: 'Menunggu Persetujuan',
  approved: 'Disetujui',
};

const RAB_CAT_NAMES = {
  A: 'Pekerjaan Persiapan', B: 'Tanah & Pondasi', C: 'Struktur', D: 'Arsitektur',
  E: 'MEP', F: 'Finishing', G: 'Lanskap', H: 'Peralatan',
};

function calcRabTotals(rab) {
  const items = rab?.items ?? [];
  const s = { ppnPercent: 11, contingencyPercent: 5, overheadPercent: 10, profitPercent: 6, ...(rab?.settings ?? {}) };
  const subtotal = items.reduce((sum, it) => sum + (it.volume || 0) * (it.hargaSatuan || 0), 0);
  const overhead = subtotal * s.overheadPercent / 100;
  const profit = subtotal * s.profitPercent / 100;
  const beforeCont = subtotal + overhead + profit;
  const contingency = beforeCont * s.contingencyPercent / 100;
  const beforePpn = beforeCont + contingency;
  const ppn = beforePpn * s.ppnPercent / 100;
  return { subtotal, overhead, profit, contingency, ppn, grandTotal: beforePpn + ppn, settings: s };
}

function buildRabSection(project) {
  const rab = project.rab;
  if (!rab?.items?.length) return '';
  const totals = calcRabTotals(rab);
  const design = project.design ?? {};
  const rows = rab.items.map((it, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${escapeHtml(it.category)}</td>
      <td>${escapeHtml(it.pekerjaan)}</td>
      <td style="text-align:right">${it.volume ?? 0}</td>
      <td>${escapeHtml(it.satuan)}</td>
      <td style="text-align:right">${formatCurrency(it.hargaSatuan)}</td>
      <td style="text-align:right">${formatCurrency((it.volume || 0) * (it.hargaSatuan || 0))}</td>
    </tr>`).join('');

  return `
  <h2>Ringkasan RAB / BoQ</h2>
  <p>Luas bangunan: ${design.luasBangunan ?? '-'} m² · Luas tapak: ${design.luasTapak ?? '-'} m² · Lantai: ${design.jumlahLantai ?? 1}</p>
  <table style="width:100%;border-collapse:collapse;font-size:11px;margin:12px 0">
    <thead><tr style="background:#f1f5f9">
      <th style="border:1px solid #e2e8f0;padding:6px">No</th>
      <th style="border:1px solid #e2e8f0;padding:6px">Kat</th>
      <th style="border:1px solid #e2e8f0;padding:6px">Uraian Pekerjaan</th>
      <th style="border:1px solid #e2e8f0;padding:6px">Vol</th>
      <th style="border:1px solid #e2e8f0;padding:6px">Sat</th>
      <th style="border:1px solid #e2e8f0;padding:6px">Harga Satuan</th>
      <th style="border:1px solid #e2e8f0;padding:6px">Jumlah</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <table style="width:320px;margin-left:auto;font-size:11px">
    <tr><td>Subtotal</td><td style="text-align:right">${formatCurrency(totals.subtotal)}</td></tr>
    <tr><td>Overhead (${totals.settings.overheadPercent}%)</td><td style="text-align:right">${formatCurrency(totals.overhead)}</td></tr>
    <tr><td>Profit (${totals.settings.profitPercent}%)</td><td style="text-align:right">${formatCurrency(totals.profit)}</td></tr>
    <tr><td>Kontinjensi (${totals.settings.contingencyPercent}%)</td><td style="text-align:right">${formatCurrency(totals.contingency)}</td></tr>
    <tr><td>PPN (${totals.settings.ppnPercent}%)</td><td style="text-align:right">${formatCurrency(totals.ppn)}</td></tr>
    <tr style="font-weight:bold"><td>GRAND TOTAL</td><td style="text-align:right">${formatCurrency(totals.grandTotal)}</td></tr>
  </table>`;
}

function buildProjectReportHtml(project) {
  const stagesHtml = TAHAPAN_DATA.map((t) => {
    const status = project.stageStatus?.[t.id] ?? 'locked';
    const approval = project.approvals?.[t.id];
    const note = project.notes?.[t.id] ?? '';
    const checklist = project.checklists?.[t.id] ?? {};
    const docs = project.documents?.[t.id] ?? [];

    const checklistHtml = t.deliverables.map((d) => {
      const done = checklist[d.name] ? '✓' : '○';
      return `<li>${done} ${escapeHtml(d.name)}</li>`;
    }).join('');

    const docsHtml = docs.length
      ? docs.map((d) => `<li>${escapeHtml(d.originalName)} (${formatDate(d.uploadedAt)})</li>`).join('')
      : '<li><em>Tidak ada dokumen</em></li>';

    return `
      <div class="stage-block">
        <h3>Tahap ${t.id}: ${escapeHtml(t.title)}</h3>
        <p><strong>Status:</strong> ${STATUS_LABELS[status] ?? status}
        ${approval ? ` &nbsp;|&nbsp; <strong>Disetujui:</strong> ${formatDate(approval)}` : ''}</p>
        ${note ? `<p><strong>Catatan:</strong> ${escapeHtml(note)}</p>` : ''}
        <div class="two-col">
          <div>
            <h4>Deliverables</h4>
            <ul>${checklistHtml}</ul>
          </div>
          <div>
            <h4>Dokumen</h4>
            <ul>${docsHtml}</ul>
          </div>
        </div>
      </div>`;
  }).join('');

  const supervisionHtml = (project.supervisionReports ?? []).length
    ? (project.supervisionReports ?? []).map((r) => `
        <div class="report-entry">
          <h4>${formatDate(r.date)}</h4>
          <p><strong>Temuan:</strong> ${escapeHtml(r.findings)}</p>
          <p><strong>Rekomendasi:</strong> ${escapeHtml(r.recommendations)}</p>
          ${r.attendees ? `<p><strong>Peserta:</strong> ${escapeHtml(r.attendees)}</p>` : ''}
        </div>`).join('')
    : '<p><em>Belum ada laporan pengawasan.</em></p>';

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a2e; padding: 40px; font-size: 12px; line-height: 1.6; }
    .header { border-bottom: 3px solid #3b82f6; padding-bottom: 16px; margin-bottom: 24px; }
    .header h1 { font-size: 22px; color: #3b82f6; margin-bottom: 4px; }
    .header p { color: #64748b; font-size: 11px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; background: #f8fafc; padding: 16px; border-radius: 8px; margin-bottom: 24px; }
    .info-grid dt { font-weight: 600; color: #475569; }
    .info-grid dd { margin-bottom: 8px; }
    h2 { font-size: 16px; color: #1e293b; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin: 24px 0 12px; }
    h3 { font-size: 13px; color: #3b82f6; margin-bottom: 6px; }
    h4 { font-size: 11px; color: #475569; margin: 8px 0 4px; }
    .stage-block { border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin-bottom: 12px; page-break-inside: avoid; }
    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 8px; }
    ul { padding-left: 18px; }
    li { margin-bottom: 3px; }
    .report-entry { border-left: 3px solid #22c55e; padding: 8px 12px; margin-bottom: 10px; background: #f0fdf4; }
    .footer { margin-top: 32px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 10px; color: #94a3b8; text-align: center; }
    .progress-bar { display: flex; gap: 4px; margin: 12px 0; }
    .progress-dot { flex: 1; height: 8px; border-radius: 4px; background: #e2e8f0; }
    .progress-dot.approved { background: #22c55e; }
    .progress-dot.active { background: #3b82f6; }
    .progress-dot.pending { background: #f59e0b; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Laporan Proyek Arsitektur</h1>
    <p>Buat Kamu — Dicetak ${formatDate(new Date().toISOString())}</p>
  </div>

  <h2>${escapeHtml(project.name)}</h2>
  <dl class="info-grid">
    <dt>Klien</dt><dd>${escapeHtml(project.clientName)}</dd>
    <dt>Spesialisasi</dt><dd>${escapeHtml(getSpecLabel(project.specialization))}</dd>
    <dt>Lokasi</dt><dd>${escapeHtml(project.location || '-')}</dd>
    <dt>Anggaran</dt><dd>${formatCurrency(project.budget)}</dd>
    <dt>Tahap Saat Ini</dt><dd>Tahap ${project.currentStage}: ${escapeHtml(getStageLabel(project.currentStage))}</dd>
    <dt>Dibuat</dt><dd>${formatDate(project.createdAt)}</dd>
    <dt>Deskripsi</dt><dd colspan="1">${escapeHtml(project.description || '-')}</dd>
  </dl>

  <div class="progress-bar">
    ${[1, 2, 3, 4, 5, 6].map((n) => {
      const s = project.stageStatus?.[n] ?? 'locked';
      const cls = s === 'approved' ? 'approved' : s === 'active' ? 'active' : s === 'pending_approval' ? 'pending' : '';
      return `<div class="progress-dot ${cls}"></div>`;
    }).join('')}
  </div>

  <h2>Ringkasan Tahapan</h2>
  ${stagesHtml}

  <h2>Laporan Pengawasan Berkala</h2>
  ${supervisionHtml}

  ${buildRabSection(project)}

  <div class="footer">
    Dokumen ini dihasilkan oleh Buat Kamu. Hak kepemilikan dokumen perancangan tetap berada pada Arsitek.
  </div>
</body>
</html>`;
}

function buildRabReportHtml(project) {
  const rab = project.rab ?? { items: [] };
  const totals = calcRabTotals(rab);
  const design = project.design ?? {};

  const grouped = {};
  rab.items.forEach((it) => {
    if (!grouped[it.category]) grouped[it.category] = [];
    grouped[it.category].push(it);
  });

  let tableRows = '';
  let no = 1;
  Object.keys(grouped).sort().forEach((cat) => {
    tableRows += `<tr style="background:#e2e8f0;font-weight:bold"><td colspan="6" style="padding:8px;border:1px solid #cbd5e1">${cat}. ${RAB_CAT_NAMES[cat] ?? cat}</td></tr>`;
    grouped[cat].forEach((it) => {
      tableRows += `<tr>
        <td style="border:1px solid #e2e8f0;padding:6px;text-align:center">${no++}</td>
        <td style="border:1px solid #e2e8f0;padding:6px">${escapeHtml(it.pekerjaan)}</td>
        <td style="border:1px solid #e2e8f0;padding:6px;text-align:right">${it.volume ?? 0}</td>
        <td style="border:1px solid #e2e8f0;padding:6px;text-align:center">${escapeHtml(it.satuan)}</td>
        <td style="border:1px solid #e2e8f0;padding:6px;text-align:right">${formatCurrency(it.hargaSatuan)}</td>
        <td style="border:1px solid #e2e8f0;padding:6px;text-align:right">${formatCurrency((it.volume || 0) * (it.hargaSatuan || 0))}</td>
      </tr>`;
    });
  });

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a2e; padding: 36px; font-size: 11px; line-height: 1.5; }
    .header { border-bottom: 3px solid #3b82f6; padding-bottom: 14px; margin-bottom: 20px; }
    .header h1 { font-size: 20px; color: #3b82f6; }
    .info { background: #f8fafc; padding: 14px; border-radius: 8px; margin-bottom: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 6px 20px; }
    .info dt { font-weight: 600; color: #475569; }
    table { width: 100%; border-collapse: collapse; }
    .summary { width: 340px; margin-left: auto; margin-top: 16px; }
    .summary td { padding: 4px 8px; }
    .grand { font-size: 14px; font-weight: bold; color: #3b82f6; border-top: 2px solid #3b82f6; }
    .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="header">
    <h1>RENCANA ANGGARAN BIAYA (RAB)</h1>
    <p>Bill of Quantity — Buat Kamu · ${formatDate(new Date().toISOString())}</p>
  </div>
  <dl class="info">
    <dt>Proyek</dt><dd>${escapeHtml(project.name)}</dd>
    <dt>Klien</dt><dd>${escapeHtml(project.clientName)}</dd>
    <dt>Lokasi</dt><dd>${escapeHtml(project.location || '-')}</dd>
    <dt>Spesialisasi</dt><dd>${escapeHtml(getSpecLabel(project.specialization))}</dd>
    <dt>Luas Bangunan</dt><dd>${design.luasBangunan ?? '-'} m²</dd>
    <dt>Luas Tapak</dt><dd>${design.luasTapak ?? '-'} m²</dd>
    <dt>Jumlah Lantai</dt><dd>${design.jumlahLantai ?? 1} lantai</dd>
    <dt>Struktur</dt><dd>${escapeHtml(design.tipeStruktur || '-')}</dd>
  </dl>
  <table>
    <thead>
      <tr style="background:#3b82f6;color:white">
        <th style="padding:8px;width:40px">No</th>
        <th style="padding:8px">Uraian Pekerjaan</th>
        <th style="padding:8px;width:70px">Volume</th>
        <th style="padding:8px;width:50px">Sat</th>
        <th style="padding:8px;width:110px">Harga Satuan</th>
        <th style="padding:8px;width:110px">Jumlah (Rp)</th>
      </tr>
    </thead>
    <tbody>${tableRows || '<tr><td colspan="6" style="padding:20px;text-align:center">Tidak ada item</td></tr>'}</tbody>
  </table>
  <table class="summary">
    <tr><td>Subtotal Pekerjaan</td><td style="text-align:right">${formatCurrency(totals.subtotal)}</td></tr>
    <tr><td>Overhead (${totals.settings.overheadPercent}%)</td><td style="text-align:right">${formatCurrency(totals.overhead)}</td></tr>
    <tr><td>Profit (${totals.settings.profitPercent}%)</td><td style="text-align:right">${formatCurrency(totals.profit)}</td></tr>
    <tr><td>Kontinjensi (${totals.settings.contingencyPercent}%)</td><td style="text-align:right">${formatCurrency(totals.contingency)}</td></tr>
    <tr><td>PPN (${totals.settings.ppnPercent}%)</td><td style="text-align:right">${formatCurrency(totals.ppn)}</td></tr>
    <tr class="grand"><td>TOTAL BIAYA KONSTRUKSI</td><td style="text-align:right">${formatCurrency(totals.grandTotal)}</td></tr>
  </table>
  ${project.budget ? `<p style="margin-top:12px">Anggaran klien: ${formatCurrency(project.budget)} · Selisih: ${formatCurrency(totals.grandTotal - project.budget)}</p>` : ''}
  <div class="footer">Dokumen RAB/BoQ — Tahap 4 Gambar Kerja & Tahap 5 Pengadaan Konstruksi</div>
</body>
</html>`;
}

function buildTenderPackageHtml(project) {
  const rabHtml = buildRabReportHtml(project);
  const rksSection = `
  <div style="page-break-before:always;padding:36px;font-family:'Segoe UI',Arial,sans-serif;font-size:11px">
    <h1 style="color:#3b82f6;border-bottom:3px solid #3b82f6;padding-bottom:10px">DOKUMEN PENGADAAN PELAKSANA KONSTRUKSI</h1>
    <p style="color:#64748b;margin-bottom:20px">Tahap 5 — ${escapeHtml(project.name)} · ${formatDate(new Date().toISOString())}</p>
    <h2 style="font-size:14px;margin:20px 0 10px">1. Uraian Rencana Kerja dan Syarat-Syarat (RKS)</h2>
    <ul style="line-height:1.8;padding-left:20px">
      <li>Lingkup pekerjaan mengacu pada Gambar Kerja dan RAB/BoQ terlampir</li>
      <li>Pelaksana wajib mematuhi spesifikasi teknis material dan metode kerja dalam dokumen perancangan</li>
      <li>Jadwal pelaksanaan disesuaikan dengan kemampuan pelaksana dan disetujui pengguna jasa</li>
      <li>Pengawasan berkala dilakukan oleh Arsitek dan Pengawas Terpadu/MK</li>
      <li>Pembayaran termin berdasarkan progres pekerjaan yang diverifikasi</li>
    </ul>
    <h2 style="font-size:14px;margin:20px 0 10px">2. Daftar Dokumen Pelelangan</h2>
    <ul style="line-height:1.8;padding-left:20px">
      <li>☑ Gambar Kerja (Working Drawing) — Tahap 4</li>
      <li>☑ RAB / Bill of Quantity — terlampir</li>
      <li>☑ Uraian RKS — dokumen ini</li>
      <li>☐ Spesifikasi Teknis Material</li>
      <li>☐ Syarat Kontrak Kerja Konstruksi</li>
    </ul>
    <h2 style="font-size:14px;margin:20px 0 10px">3. Kualifikasi Pelaksana</h2>
    <ul style="line-height:1.8;padding-left:20px">
      <li>Badan usaha konstruksi terdaftar dan memiliki SBU yang sesuai</li>
      <li>Pengalaman proyek sejenis minimal 2 proyek dalam 5 tahun terakhir</li>
      <li>Memiliki tenaga ahli: Site Manager, Pelaksana Lapangan, Admin K3</li>
    </ul>
    <div style="margin-top:40px;padding:16px;background:#f8fafc;border-radius:8px">
      <strong>Catatan Arsitek:</strong> Dokumen pelelangan disusun berdasarkan Gambar Kerja dan RAB yang telah disetujui pengguna jasa.
      Rekomendasi pemilihan pelaksana konstruksi memerlukan persetujuan pengguna jasa.
    </div>
  </div>`;

  return rabHtml.replace('</body></html>', `${rksSection}</body></html>`);
}

module.exports = { buildProjectReportHtml, buildRabReportHtml, buildTenderPackageHtml };
