import {
  TAHAPAN,
  SPESIALISASI,
  HAK_KEkayaan,
  LAYANAN_UTAMA,
  STAGE_STATUS,
  SPECIALIZATION_OPTIONS,
} from './data/content.js';
import {
  renderRabView,
  collectRabFromDom,
  collectDesignFromDom,
  generateRabFromTemplate,
  calcRabSummary,
  recalcVolumesFromDesign,
  createEmptyRab,
  formatRupiah,
} from './rab-view.js';
import { createEmptyDesign } from './data/rab.js';

const state = {
  view: 'dashboard',
  projects: [],
  selectedProject: null,
  selectedTahap: null,
  selectedSpec: null,
  searchQuery: '',
  stageModalProjectId: null,
  stageModalStageId: null,
  selectedRabProject: null,
};

const $ = (sel) => document.querySelector(sel);
const content = $('#content');

function migrateProject(p) {
  const checklists = { ...(p.checklists ?? {}) };
  TAHAPAN.forEach((t) => {
    if (!checklists[t.id]) checklists[t.id] = {};
    t.deliverables.forEach((d) => {
      if (checklists[t.id][d.name] === undefined) checklists[t.id][d.name] = false;
    });
  });
  return {
    ...p,
    checklists,
    documents: p.documents ?? {},
    supervisionReports: p.supervisionReports ?? [],
    activityLog: p.activityLog ?? [],
    rab: p.rab ?? createEmptyRab(),
    design: { ...createEmptyDesign(), ...(p.design ?? {}) },
  };
}

async function init() {
  const raw = await window.api.getProjects();
  state.projects = raw.map(migrateProject);
  bindEvents();
  populateSpecializationSelect();
  bindMenuEvents();
  render();
  await maybeShowWelcome();
}

async function maybeShowWelcome() {
  const settings = await window.api.getSettings();
  if (!settings.welcomeShown && state.projects.length === 0) {
    $('#welcomeModal').classList.remove('hidden');
  }
}

async function dismissWelcome(openProject = false) {
  await window.api.setSettings({ welcomeShown: true });
  $('#welcomeModal').classList.add('hidden');
  if (openProject) openProjectModal();
}

function bindMenuEvents() {
  window.api.onMenu('menu:newProject', () => openProjectModal());
  window.api.onMenu('menu:exportPdf', () => {
    const p = getActiveProject();
    if (p) exportProjectPdf(p);
    else window.api.info('Export PDF', 'Buka detail proyek terlebih dahulu.');
  });
  window.api.onMenu('menu:exportRabPdf', () => {
    const p = state.selectedRabProject
      ? state.projects.find((pr) => pr.id === state.selectedRabProject)
      : getActiveProject();
    if (p?.rab?.items?.length) exportRabPdf(p);
    else window.api.info('Export RAB', 'Buka RAB proyek yang memiliki item terlebih dahulu.');
  });
  window.api.onMenu('menu:exportRabCsv', () => {
    const p = state.selectedRabProject
      ? state.projects.find((pr) => pr.id === state.selectedRabProject)
      : getActiveProject();
    if (p?.rab?.items?.length) exportRabCsv(p);
    else window.api.info('Export CSV', 'Buka RAB proyek yang memiliki item terlebih dahulu.');
  });
  window.api.onMenu('menu:exportTender', () => {
    const p = getActiveProject();
    if (p?.rab?.items?.length) exportTenderPdf(p);
    else window.api.info('Paket Pengadaan', 'Proyek harus memiliki RAB terlebih dahulu.');
  });
  window.api.onMenu('menu:backup', () => doBackup());
  window.api.onMenu('menu:restore', () => doRestore());
}

function getActiveProject() {
  if (state.selectedProject) return state.projects.find((p) => p.id === state.selectedProject);
  if (state.selectedRabProject) return state.projects.find((p) => p.id === state.selectedRabProject);
  if (state.projects.length === 1) return state.projects[0];
  return null;
}

async function doBackup() {
  const path = await window.api.backupExport();
  if (path) await window.api.info('Backup Berhasil', `Data disimpan di:\n${path}`);
}

async function doRestore() {
  const result = await window.api.backupImport();
  if (result?.error) await window.api.info('Error', result.error);
  else if (result?.count) {
    state.projects = (await window.api.getProjects()).map(migrateProject);
    state.selectedProject = null;
    state.selectedRabProject = null;
    render();
    await window.api.info('Restore Berhasil', `${result.count} proyek dipulihkan.`);
  }
}

async function exportRabPdf(project) {
  const path = await window.api.exportRabPdf(project);
  if (path) {
    addActivity(project, 'export', 'RAB PDF diekspor');
    await saveProject(project);
    await window.api.info('Export Berhasil', `RAB disimpan di:\n${path}`);
  }
}

async function exportRabCsv(project) {
  const path = await window.api.exportRabCsv(project);
  if (path) {
    addActivity(project, 'export', 'RAB CSV diekspor');
    await saveProject(project);
    await window.api.info('Export Berhasil', `CSV disimpan di:\n${path}\n(Buka dengan Excel)`);
  }
}

async function exportTenderPdf(project) {
  const path = await window.api.exportTenderPdf(project);
  if (path) {
    addActivity(project, 'export', 'Paket Pengadaan PDF diekspor');
    await saveProject(project);
    await window.api.info('Export Berhasil', `Paket Pengadaan disimpan di:\n${path}`);
  }
}

function bindEvents() {
  document.querySelectorAll('.nav-item').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.nav-item').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      state.view = btn.dataset.view;
      state.selectedProject = null;
      state.selectedTahap = null;
      state.selectedSpec = null;
      if (state.view !== 'rab') state.selectedRabProject = null;
      render();
    });
  });

  $('#btnNewProject').addEventListener('click', () => openProjectModal());
  $('#modalClose').addEventListener('click', closeProjectModal);
  $('#modalCancel').addEventListener('click', closeProjectModal);
  $('#projectForm').addEventListener('submit', handleProjectSubmit);
  $('#stageModalClose').addEventListener('click', () => $('#stageModal').classList.add('hidden'));

  $('#globalSearch').addEventListener('input', (e) => {
    state.searchQuery = e.target.value.toLowerCase().trim();
    render();
  });

  $('#projectModal').addEventListener('click', (e) => {
    if (e.target === $('#projectModal')) closeProjectModal();
  });
  $('#stageModal').addEventListener('click', (e) => {
    if (e.target === $('#stageModal')) $('#stageModal').classList.add('hidden');
  });

  $('#supervisionModalClose').addEventListener('click', closeSupervisionModal);
  $('#supervisionCancel').addEventListener('click', closeSupervisionModal);
  $('#supervisionForm').addEventListener('submit', handleSupervisionSubmit);
  $('#supervisionModal').addEventListener('click', (e) => {
    if (e.target === $('#supervisionModal')) closeSupervisionModal();
  });

  $('#btnWelcomeStart')?.addEventListener('click', () => dismissWelcome(true));
  $('#welcomeModal')?.addEventListener('click', (e) => {
    if (e.target === $('#welcomeModal')) dismissWelcome(false);
  });
}

function populateSpecializationSelect() {
  const sel = $('#specialization');
  sel.innerHTML = SPECIALIZATION_OPTIONS.map(
    (o) => `<option value="${o.value}">${o.label}</option>`
  ).join('');
}

function getSpecLabel(id) {
  return SPESIALISASI.find((s) => s.id === id)?.title ?? id;
}

function formatCurrency(n) {
  if (!n) return '-';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
}

function formatDate(iso) {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatFileSize(bytes) {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  let size = bytes;
  while (size >= 1024 && i < units.length - 1) { size /= 1024; i++; }
  return `${size.toFixed(i > 0 ? 1 : 0)} ${units[i]}`;
}

function addActivity(project, action, detail) {
  project.activityLog = project.activityLog ?? [];
  project.activityLog.unshift({ action, detail, timestamp: new Date().toISOString() });
  if (project.activityLog.length > 100) project.activityLog.length = 100;
}

async function saveProject(project) {
  const updated = await window.api.updateProject(project);
  state.projects = state.projects.map((p) => (p.id === updated.id ? updated : p));
  if (state.selectedProject === updated.id) state.selectedProject = updated.id;
  return updated;
}

async function exportProjectPdf(project) {
  const path = await window.api.exportPdf(project);
  if (path) {
    addActivity(project, 'export', 'Laporan PDF diekspor');
    await saveProject(project);
    await window.api.info('Export Berhasil', `Laporan disimpan di:\n${path}`);
  }
}

function highlight(text, query) {
  if (!query || !text) return text;
  const re = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return String(text).replace(re, '<mark>$1</mark>');
}

function render() {
  switch (state.view) {
    case 'dashboard': renderDashboard(); break;
    case 'projects': renderProjects(); break;
    case 'rab': renderRab(); break;
    case 'tahapan': renderTahapan(); break;
    case 'spesialisasi': renderSpesialisasi(); break;
    case 'hki': renderHKI(); break;
    case 'activity': renderActivity(); break;
    default: renderDashboard();
  }
}

function renderDashboard() {
  const q = state.searchQuery;
  const activeProjects = state.projects.filter((p) => p.currentStage <= 6 && !isProjectComplete(p));
  const completed = state.projects.filter(isProjectComplete);
  const rabProjects = state.projects.filter((p) => (p.rab?.items?.length ?? 0) > 0).length;

  content.innerHTML = `
    <div class="page-header">
      <h2>Beranda</h2>
      <p>Sistem manajemen pekerjaan arsitek — dari konsultasi awal, konsep, gambar kerja, hingga pengawasan konstruksi.</p>
    </div>

    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-value">${state.projects.length}</div>
        <div class="stat-label">Total Proyek</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${activeProjects.length}</div>
        <div class="stat-label">Proyek Aktif</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${completed.length}</div>
        <div class="stat-label">Selesai</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${rabProjects}</div>
        <div class="stat-label">Proyek dengan RAB</div>
      </div>
    </div>

    <div class="page-header" style="margin-bottom:16px">
      <h2 style="font-size:18px">Lingkup Layanan Utama</h2>
    </div>
    <div class="card-grid" style="margin-bottom:32px">
      ${LAYANAN_UTAMA.filter((l) => !q || l.nama.toLowerCase().includes(q) || l.desc.toLowerCase().includes(q))
        .map((l) => {
          const tahap = TAHAPAN.find((t) => t.id === l.tahap);
          return `
            <div class="card card-static" onclick="window.__goTahap(${l.tahap})">
              <div class="card-icon">${tahap?.icon ?? '◎'}</div>
              <h3>Tahap ${l.tahap}: ${highlight(l.nama, q)}</h3>
              <p>${highlight(l.desc, q)}</p>
            </div>`;
        }).join('')}
    </div>

    ${activeProjects.length > 0 ? `
      <div class="page-header" style="margin-bottom:16px">
        <h2 style="font-size:18px">Proyek Aktif</h2>
      </div>
      <div class="card-grid">
        ${activeProjects.slice(0, 4).map(renderProjectCard).join('')}
      </div>
    ` : ''}

    <div class="highlight-box" style="margin-top:28px">
      <strong>Prinsip Pelaksanaan:</strong> Setiap tahapan pekerjaan perancangan dapat dilaksanakan jika tahap pekerjaan sebelumnya telah mendapat persetujuan pengguna jasa.
    </div>
  `;

  bindProjectCardEvents();
}

function isProjectComplete(p) {
  return p.stageStatus?.[6] === 'approved';
}

function renderProjectCard(p) {
  const currentTahap = TAHAPAN.find((t) => t.id === p.currentStage);
  const status = p.stageStatus?.[p.currentStage] ?? 'active';
  const dots = [1, 2, 3, 4, 5, 6].map((n) => {
    const s = p.stageStatus?.[n] ?? 'locked';
    return `<div class="stage-dot ${s === 'approved' ? 'approved' : s === 'active' || s === 'pending_approval' ? s === 'pending_approval' ? 'pending' : 'active' : ''}" title="Tahap ${n}"></div>`;
  }).join('');

  return `
    <div class="project-card" data-project-id="${p.id}">
      <div class="project-card-header">
        <div>
          <h3>${p.name}</h3>
          <div class="project-meta">${p.clientName} · ${getSpecLabel(p.specialization)}</div>
        </div>
        <span class="badge ${STAGE_STATUS[status]?.class ?? 'status-active'}">${STAGE_STATUS[status]?.label ?? status}</span>
      </div>
      <div class="stage-progress">${dots}</div>
      <p style="font-size:13px;color:var(--text-secondary)">Tahap saat ini: <strong>${currentTahap?.title ?? '-'}</strong></p>
      <div class="project-actions">
        <button class="btn btn-sm btn-primary btn-view-project" data-id="${p.id}">Kelola</button>
        <button class="btn btn-sm btn-ghost btn-edit-project" data-id="${p.id}">Edit</button>
      </div>
    </div>`;
}

function renderProjects() {
  const q = state.searchQuery;

  if (state.selectedProject) {
    renderProjectDetail(state.selectedProject);
    return;
  }

  const filtered = state.projects.filter((p) =>
    !q ||
    p.name.toLowerCase().includes(q) ||
    p.clientName.toLowerCase().includes(q) ||
    getSpecLabel(p.specialization).toLowerCase().includes(q)
  );

  content.innerHTML = `
    <div class="page-header">
      <h2>Manajemen Proyek</h2>
      <p>Kelola proyek perancangan arsitektur dengan alur persetujuan 6 tahapan.</p>
    </div>
    ${filtered.length === 0 ? `
      <div class="empty-state">
        <div class="empty-icon">▣</div>
        <h3>Belum ada proyek</h3>
        <p>Buat proyek baru untuk mulai melacak tahapan perancangan arsitektur.</p>
        <button class="btn btn-primary" onclick="window.__newProject()">+ Proyek Baru</button>
      </div>
    ` : `<div class="card-grid">${filtered.map(renderProjectCard).join('')}</div>`}
  `;

  bindProjectCardEvents();
}

function renderProjectDetail(projectId) {
  const p = typeof projectId === 'string'
    ? state.projects.find((pr) => pr.id === projectId)
    : projectId;

  if (!p) { state.selectedProject = null; renderProjects(); return; }

  content.innerHTML = `
    <div class="page-header">
      <button class="btn btn-ghost btn-sm" id="btnBackProjects" style="margin-bottom:12px">← Kembali</button>
      <h2>${p.name}</h2>
      <p>${p.clientName} · ${getSpecLabel(p.specialization)} · ${p.location || 'Lokasi belum diisi'}</p>
    </div>

    <div class="detail-section">
      <h3>Informasi Proyek & Desain</h3>
      <ul class="detail-list">
        <li><strong>Anggaran Klien:</strong> ${formatCurrency(p.budget)}</li>
        <li><strong>Luas Bangunan:</strong> ${p.design?.luasBangunan ? p.design.luasBangunan + ' m²' : '-'}</li>
        <li><strong>Luas Tapak:</strong> ${p.design?.luasTapak ? p.design.luasTapak + ' m²' : '-'}</li>
        <li><strong>Lantai / Struktur:</strong> ${p.design?.jumlahLantai ?? 1} lantai · ${p.design?.tipeStruktur ?? '-'}</li>
        <li><strong>Dibuat:</strong> ${formatDate(p.createdAt)}</li>
        <li><strong>Deskripsi:</strong> ${p.description || '-'}</li>
      </ul>
    </div>

    ${(() => {
      const rabSum = calcRabSummary(p.rab ?? createEmptyRab());
      const itemCount = p.rab?.items?.length ?? 0;
      if (!itemCount) return `
        <div class="highlight-box" style="margin-bottom:20px">
          <strong>RAB belum dibuat.</strong> Buat Rencana Anggaran Biaya terhubung dengan data desain proyek ini.
          <button class="btn btn-primary btn-sm btn-goto-rab" data-id="${p.id}" style="margin-top:10px">Buat RAB →</button>
        </div>`;
      const diff = p.budget ? rabSum.grandTotal - p.budget : null;
      return `
        <div class="detail-section" style="border-left:3px solid var(--success)">
          <h3>RAB / Bill of Quantity</h3>
          <ul class="detail-list">
            <li><strong>Total Item:</strong> ${itemCount} pekerjaan</li>
            <li><strong>Total Biaya Konstruksi:</strong> <span style="color:var(--success);font-weight:700">${formatRupiah(rabSum.grandTotal)}</span></li>
            ${diff != null ? `<li><strong>Selisih vs Anggaran:</strong> <span style="color:${diff > 0 ? 'var(--danger)' : 'var(--success)'}">${diff > 0 ? '+' : ''}${formatRupiah(diff)}</span></li>` : ''}
          </ul>
          <button class="btn btn-primary btn-sm btn-goto-rab" data-id="${p.id}" style="margin-top:10px">Kelola RAB →</button>
        </div>`;
    })()}

    <div class="page-header" style="margin-bottom:16px">
      <h2 style="font-size:18px">Alur Tahapan Proyek</h2>
    </div>
    <div class="timeline">
      ${TAHAPAN.map((t) => renderProjectStageItem(p, t)).join('')}
    </div>

    <div class="project-actions" style="margin-top:20px">
      <button class="btn btn-primary btn-goto-rab" data-id="${p.id}">RAB / BoQ</button>
      <button class="btn btn-ghost btn-export-pdf" data-id="${p.id}">Export Laporan</button>
      ${(p.rab?.items?.length ?? 0) > 0 && p.currentStage >= 5 ? `
        <button class="btn btn-ghost btn-export-tender" data-id="${p.id}">Paket Pengadaan</button>
      ` : ''}
      ${['active', 'pending_approval', 'approved'].includes(p.stageStatus?.[6]) ? `
        <button class="btn btn-ghost btn-add-supervision" data-id="${p.id}">+ Laporan Pengawasan</button>
      ` : ''}
      <button class="btn btn-ghost btn-edit-project" data-id="${p.id}">Edit Proyek</button>
      <button class="btn btn-danger btn-delete-project" data-id="${p.id}">Hapus Proyek</button>
    </div>

    ${(p.supervisionReports ?? []).length > 0 ? `
      <div class="page-header" style="margin:28px 0 16px">
        <h2 style="font-size:18px">Laporan Pengawasan Berkala</h2>
      </div>
      ${(p.supervisionReports ?? []).map((r) => `
        <div class="supervision-card">
          <h4>${formatDate(r.date)}</h4>
          <p><strong>Temuan:</strong> ${r.findings}</p>
          <p><strong>Rekomendasi:</strong> ${r.recommendations}</p>
          ${r.attendees ? `<p><strong>Peserta:</strong> ${r.attendees}</p>` : ''}
        </div>
      `).join('')}
    ` : ''}

    ${(p.activityLog ?? []).length > 0 ? `
      <div class="page-header" style="margin:28px 0 16px">
        <h2 style="font-size:18px">Aktivitas Terbaru</h2>
      </div>
      <ul class="activity-list">
        ${(p.activityLog ?? []).slice(0, 5).map((a) => renderActivityItem(a)).join('')}
      </ul>
    ` : ''}
  `;

  $('#btnBackProjects').addEventListener('click', () => {
    state.selectedProject = null;
    render();
  });

  bindProjectStageEvents(p);
  bindProjectCardEvents();
  content.querySelectorAll('.btn-goto-rab').forEach((btn) => {
    btn.addEventListener('click', () => goToRab(btn.dataset.id));
  });
}

function renderProjectStageItem(project, tahap) {
  const status = project.stageStatus?.[tahap.id] ?? 'locked';
  const statusInfo = STAGE_STATUS[status] ?? STAGE_STATUS.locked;
  const note = project.notes?.[tahap.id] ?? '';
  const approvalDate = project.approvals?.[tahap.id];

  return `
    <div class="timeline-item ${status === 'approved' ? 'approved' : status === 'active' ? 'active' : status === 'pending_approval' ? 'pending' : ''}" data-stage="${tahap.id}">
      <div class="timeline-header">
        <h3>${tahap.icon} Tahap ${tahap.id}: ${tahap.title}</h3>
        <span class="badge ${statusInfo.class}">${statusInfo.label}</span>
      </div>
      <div class="timeline-body">
        <p>${tahap.ringkasan}</p>
        ${approvalDate ? `<p style="margin-top:8px;color:var(--success)">✓ Disetujui: ${formatDate(approvalDate)}</p>` : ''}
        ${note ? `<p style="margin-top:8px"><em>Catatan: ${note}</em></p>` : ''}
        <div class="stage-actions">
          <button class="btn btn-sm btn-primary btn-manage-stage" data-stage="${tahap.id}" ${status === 'locked' ? 'disabled style="opacity:0.4;cursor:not-allowed"' : ''}>Kelola Tahap</button>
          ${status === 'active' ? `<button class="btn btn-sm btn-ghost btn-submit-approval" data-stage="${tahap.id}">Ajukan Persetujuan</button>` : ''}
          ${status === 'pending_approval' ? `<button class="btn btn-sm btn-success btn-approve-stage" data-stage="${tahap.id}">Setujui Tahap</button>` : ''}
        </div>
      </div>
    </div>`;
}

function bindProjectStageEvents(project) {
  content.querySelectorAll('.btn-manage-stage').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (!btn.disabled) openStageManageModal(project.id, parseInt(btn.dataset.stage, 10));
    });
  });

  content.querySelectorAll('.btn-submit-approval').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const stage = parseInt(btn.dataset.stage, 10);
      const p = state.projects.find((pr) => pr.id === project.id);
      addActivity(p, 'submit', `Tahap ${stage} diajukan untuk persetujuan`);
      p.stageStatus = { ...p.stageStatus, [stage]: 'pending_approval' };
      await saveProject(p);
      state.selectedProject = p.id;
      render();
    });
  });

  content.querySelectorAll('.btn-approve-stage').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const stage = parseInt(btn.dataset.stage, 10);
      const ok = await window.api.confirm(`Setujui Tahap ${stage}? Tahap selanjutnya akan dibuka.`);
      if (ok) await approveStage(project.id, stage);
    });
  });

  content.querySelectorAll('.btn-export-pdf').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const p = state.projects.find((pr) => pr.id === btn.dataset.id);
      if (p) await exportProjectPdf(p);
    });
  });

  content.querySelectorAll('.btn-export-tender').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const p = state.projects.find((pr) => pr.id === btn.dataset.id);
      if (p) await exportTenderPdf(p);
    });
  });

  content.querySelectorAll('.btn-add-supervision').forEach((btn) => {
    btn.addEventListener('click', () => openSupervisionModal(btn.dataset.id));
  });
}

async function approveStage(projectId, stage) {
  const p = state.projects.find((pr) => pr.id === projectId);
  if (!p) return;

  p.stageStatus = { ...p.stageStatus, [stage]: 'approved' };
  p.approvals = { ...p.approvals, [stage]: new Date().toISOString() };
  addActivity(p, 'approve', `Tahap ${stage}: ${TAHAPAN.find((t) => t.id === stage)?.title ?? ''} disetujui`);

  if (stage < 6) {
    p.stageStatus[stage + 1] = 'active';
    p.currentStage = stage + 1;
  }

  await saveProject(p);
  state.selectedProject = p.id;
  render();
}

function bindProjectCardEvents() {
  content.querySelectorAll('.btn-view-project').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      state.selectedProject = btn.dataset.id;
      state.view = 'projects';
      render();
    });
  });

  content.querySelectorAll('.btn-edit-project').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const p = state.projects.find((pr) => pr.id === btn.dataset.id);
      if (p) openProjectModal(p);
    });
  });

  content.querySelectorAll('.btn-delete-project').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const ok = await window.api.confirm('Hapus proyek ini? Tindakan tidak dapat dibatalkan.');
      if (ok) {
        await window.api.deleteProject(btn.dataset.id);
        state.projects = state.projects.filter((p) => p.id !== btn.dataset.id);
        state.selectedProject = null;
        render();
      }
    });
  });
}

function renderTahapan() {
  const q = state.searchQuery;

  if (state.selectedTahap) {
    renderTahapDetail(state.selectedTahap);
    return;
  }

  content.innerHTML = `
    <div class="page-header">
      <h2>Tahapan Pekerjaan Arsitek</h2>
      <p>Pelaksanaan pekerjaan perencanaan dan perancangan arsitektur dalam 6 tahapan berurutan.</p>
    </div>
    <div class="timeline">
      ${TAHAPAN.filter((t) =>
        !q ||
        t.title.toLowerCase().includes(q) ||
        t.ringkasan.toLowerCase().includes(q)
      ).map((t) => `
        <div class="timeline-item active" style="cursor:pointer" data-tahap-id="${t.id}">
          <div class="timeline-header">
            <h3>${t.icon} Tahap ${t.id}: ${highlight(t.title, q)}</h3>
          </div>
          <div class="timeline-body">
            <p>${highlight(t.ringkasan, q)}</p>
            <button class="btn btn-sm btn-ghost" style="margin-top:12px">Lihat Detail →</button>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  content.querySelectorAll('[data-tahap-id]').forEach((el) => {
    el.addEventListener('click', () => {
      state.selectedTahap = parseInt(el.dataset.tahapId, 10);
      render();
    });
  });
}

function renderTahapDetail(id) {
  const t = TAHAPAN.find((x) => x.id === id);
  if (!t) { state.selectedTahap = null; renderTahapan(); return; }

  content.innerHTML = `
    <div class="page-header">
      <button class="btn btn-ghost btn-sm" id="btnBackTahap" style="margin-bottom:12px">← Kembali</button>
      <h2>${t.icon} Tahap ${t.id}: ${t.title}</h2>
      <p>${t.ringkasan}</p>
    </div>

    <div class="detail-section">
      <h3>Prasyarat</h3>
      <p style="font-size:13px;color:var(--text-secondary);line-height:1.65">${t.prasyarat}</p>
    </div>

    <div class="detail-section">
      <h3>Kegiatan</h3>
      <ul class="detail-list">${t.kegiatan.map((k) => `<li>${k}</li>`).join('')}</ul>
    </div>

    <div class="detail-section">
      <h3>Deliverables / Output</h3>
      <ul class="detail-list">${t.deliverables.map((d) => `<li><strong>${d.name}:</strong> ${d.desc}</li>`).join('')}</ul>
    </div>

    <div class="detail-section">
      <h3>Persetujuan Pengguna Jasa</h3>
      <p style="font-size:13px;color:var(--text-secondary);line-height:1.65">${t.persetujuan}</p>
    </div>

    ${t.sasaran.length > 0 ? `
      <div class="detail-section">
        <h3>Sasaran Tahap</h3>
        <ul class="detail-list">${t.sasaran.map((s) => `<li>${s}</li>`).join('')}</ul>
      </div>
    ` : ''}

    ${t.catatanKhusus ? `
      <div class="highlight-box"><strong>Catatan Khusus:</strong> ${t.catatanKhusus}</div>
    ` : ''}
  `;

  $('#btnBackTahap').addEventListener('click', () => {
    state.selectedTahap = null;
    render();
  });
}

function renderSpesialisasi() {
  const q = state.searchQuery;

  if (state.selectedSpec) {
    renderSpecDetail(state.selectedSpec);
    return;
  }

  content.innerHTML = `
    <div class="page-header">
      <h2>Spesialisasi Bidang Pekerjaan</h2>
      <p>Jenis bidang pekerjaan arsitek berdasarkan fokus keahlian.</p>
    </div>
    <div class="card-grid">
      ${SPESIALISASI.filter((s) =>
        !q ||
        s.title.toLowerCase().includes(q) ||
        s.deskripsi.toLowerCase().includes(q)
      ).map((s) => `
        <div class="card" data-spec-id="${s.id}" style="border-top: 3px solid ${s.color}">
          <div class="card-icon">${s.icon}</div>
          <h3>${highlight(s.title, q)}</h3>
          <p>${highlight(s.deskripsi, q)}</p>
          <div class="tags">${s.cakupan.slice(0, 3).map((c) => `<span class="tag">${c}</span>`).join('')}</div>
        </div>
      `).join('')}
    </div>
  `;

  content.querySelectorAll('[data-spec-id]').forEach((el) => {
    el.addEventListener('click', () => {
      state.selectedSpec = el.dataset.specId;
      render();
    });
  });
}

function renderSpecDetail(id) {
  const s = SPESIALISASI.find((x) => x.id === id);
  if (!s) { state.selectedSpec = null; renderSpesialisasi(); return; }

  content.innerHTML = `
    <div class="page-header">
      <button class="btn btn-ghost btn-sm" id="btnBackSpec" style="margin-bottom:12px">← Kembali</button>
      <h2>${s.icon} ${s.title}</h2>
      <p>${s.deskripsi}</p>
    </div>

    <div class="detail-section">
      <h3>Cakupan Pekerjaan</h3>
      <div class="tags">${s.cakupan.map((c) => `<span class="tag">${c}</span>`).join('')}</div>
    </div>

    <div class="detail-section">
      <h3>Tahapan Relevan</h3>
      <ul class="detail-list">
        ${s.tahapanRelevan.map((n) => {
          const t = TAHAPAN.find((x) => x.id === n);
          return `<li><strong>Tahap ${n}:</strong> ${t?.title ?? '-'}</li>`;
        }).join('')}
      </ul>
    </div>
  `;

  $('#btnBackSpec').addEventListener('click', () => {
    state.selectedSpec = null;
    render();
  });
}

function renderHKI() {
  const q = state.searchQuery;

  content.innerHTML = `
    <div class="page-header">
      <h2>Hak Milik & Hak Kekayaan Intelektual</h2>
      <p>Ketentuan hak milik dokumen, hak perwujudan rancangan, dan regulasi HKI yang berlaku.</p>
    </div>
    <div class="hki-grid">
      ${HAK_KEkayaan.filter((h) =>
        !q ||
        h.title.toLowerCase().includes(q) ||
        h.points.some((p) => p.toLowerCase().includes(q))
      ).map((h) => `
        <div class="hki-card">
          <h3>${h.icon} ${highlight(h.title, q)}</h3>
          <ul>${h.points.map((p) => `<li>${highlight(p, q)}</li>`).join('')}</ul>
        </div>
      `).join('')}
    </div>

    <div class="highlight-box" style="margin-top:24px">
      <strong>Catatan Penting:</strong> Hak kepemilikan atas dokumen perancangan tetap berada pada Arsitek. Pengguna jasa mendapat hak perwujudan sebanyak 1 (satu) kali setelah memenuhi kewajiban pembayaran imbalan jasa.
    </div>
  `;
}

function openStageManageModal(projectId, stageId) {
  const p = state.projects.find((pr) => pr.id === projectId);
  const t = TAHAPAN.find((x) => x.id === stageId);
  if (!p || !t) return;

  state.stageModalProjectId = projectId;
  state.stageModalStageId = stageId;

  const status = p.stageStatus?.[stageId] ?? 'locked';
  const statusInfo = STAGE_STATUS[status] ?? STAGE_STATUS.locked;
  const note = p.notes?.[stageId] ?? '';
  const docs = p.documents?.[stageId] ?? [];
  const checklist = p.checklists?.[stageId] ?? {};

  const rabSummary = calcRabSummary(p.rab ?? createEmptyRab());
  const showRabTab = stageId === 4 || stageId === 5;

  $('#stageModalTitle').textContent = `Tahap ${t.id}: ${t.title}`;
  $('#stageModalBody').innerHTML = `
    <div style="padding:0 24px 12px;display:flex;align-items:center;gap:10px">
      <span class="badge ${statusInfo.class}">${statusInfo.label}</span>
      <span style="font-size:13px;color:var(--text-muted)">${t.ringkasan}</span>
    </div>
    <div class="modal-tabs">
      <button class="modal-tab active" data-tab="info">Informasi</button>
      <button class="modal-tab" data-tab="checklist">Deliverables</button>
      <button class="modal-tab" data-tab="documents">Dokumen (${docs.length})</button>
      ${showRabTab ? `<button class="modal-tab" data-tab="rab">RAB / BoQ</button>` : ''}
      <button class="modal-tab" data-tab="notes">Catatan</button>
    </div>

    <div class="modal-tab-content">
      <div class="modal-tab-panel active" data-panel="info">
        <div class="section-label">Kegiatan</div>
        <ul class="detail-list">${t.kegiatan.map((k) => `<li>${k}</li>`).join('')}</ul>
        <div class="section-label">Persetujuan</div>
        <p style="font-size:13px;color:var(--text-secondary);line-height:1.65">${t.persetujuan}</p>
        ${t.sasaran.length ? `
          <div class="section-label">Sasaran</div>
          <ul class="detail-list">${t.sasaran.map((s) => `<li>${s}</li>`).join('')}</ul>
        ` : ''}
        ${t.catatanKhusus ? `<div class="highlight-box" style="margin-top:12px"><strong>Catatan:</strong> ${t.catatanKhusus}</div>` : ''}
      </div>

      <div class="modal-tab-panel" data-panel="checklist">
        <p style="font-size:13px;color:var(--text-muted);margin-bottom:12px">Centang deliverables yang sudah selesai:</p>
        <ul class="checklist" id="stageChecklist">
          ${t.deliverables.map((d) => `
            <li>
              <input type="checkbox" id="chk-${stageId}-${d.name.replace(/\s/g, '-')}" data-deliverable="${d.name}" ${checklist[d.name] ? 'checked' : ''} />
              <label for="chk-${stageId}-${d.name.replace(/\s/g, '-')}">${d.name} — ${d.desc}</label>
            </li>
          `).join('')}
        </ul>
        <button class="btn btn-primary btn-sm" id="btnSaveChecklist" style="margin-top:12px">Simpan Checklist</button>
      </div>

      <div class="modal-tab-panel" data-panel="documents">
        <div class="toolbar-row">
          <button class="btn btn-primary btn-sm" id="btnUploadDoc">+ Upload Dokumen</button>
        </div>
        <ul class="doc-list" id="stageDocList">
          ${docs.length ? docs.map((d) => renderDocItem(d)).join('') : '<li style="color:var(--text-muted);font-size:13px">Belum ada dokumen.</li>'}
        </ul>
      </div>

      ${showRabTab ? `
      <div class="modal-tab-panel" data-panel="rab">
        <div class="highlight-box" style="margin-bottom:14px">
          RAB terhubung dengan data desain proyek ini. Tahap ${stageId === 4 ? '4' : '5'} memerlukan RAB/BoQ ${stageId === 5 ? 'untuk dokumen pelelangan' : 'sebagai deliverable gambar kerja'}.
        </div>
        <ul class="detail-list">
          <li><strong>Item RAB:</strong> ${p.rab?.items?.length ?? 0} pekerjaan</li>
          <li><strong>Total Biaya:</strong> <span style="color:var(--success)">${formatRupiah(rabSummary.grandTotal)}</span></li>
          <li><strong>Luas Bangunan:</strong> ${p.design?.luasBangunan ?? '-'} m²</li>
        </ul>
        <div class="stage-actions" style="margin-top:14px">
          <button class="btn btn-primary btn-sm" id="btnOpenRabFromStage">Kelola RAB →</button>
          <button class="btn btn-ghost btn-sm" id="btnExportRabFromStage">Export RAB PDF</button>
          ${stageId === 5 ? `<button class="btn btn-ghost btn-sm" id="btnExportTenderFromStage">Paket Pengadaan PDF</button>` : ''}
        </div>
      </div>
      ` : ''}

      <div class="modal-tab-panel" data-panel="notes">
        <label style="font-size:12px;font-weight:600;color:var(--text-secondary)">Catatan Tahap</label>
        <textarea class="note-area" id="stageNoteInput" placeholder="Catatan progress, meeting, dll.">${note}</textarea>
        <button class="btn btn-primary btn-sm" id="btnSaveNote" style="margin-top:10px">Simpan Catatan</button>
      </div>
    </div>
  `;

  bindStageModalEvents(p, stageId);
  $('#stageModal').classList.remove('hidden');
}

function renderDocItem(d) {
  return `
    <li class="doc-item" data-doc-id="${d.id}">
      <div class="doc-item-info">
        <div class="doc-item-name">${d.originalName}</div>
        <div class="doc-item-meta">${formatFileSize(d.size)} · ${formatDate(d.uploadedAt)}</div>
      </div>
      <div class="doc-item-actions">
        <button class="btn btn-sm btn-ghost btn-open-doc" data-path="${d.path}">Buka</button>
        <button class="btn btn-sm btn-danger btn-delete-doc" data-path="${d.path}" data-id="${d.id}">Hapus</button>
      </div>
    </li>`;
}

function bindStageModalEvents(project, stageId) {
  const modal = $('#stageModalBody');

  modal.querySelectorAll('.modal-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      modal.querySelectorAll('.modal-tab').forEach((t) => t.classList.remove('active'));
      modal.querySelectorAll('.modal-tab-panel').forEach((p) => p.classList.remove('active'));
      tab.classList.add('active');
      modal.querySelector(`[data-panel="${tab.dataset.tab}"]`)?.classList.add('active');
    });
  });

  $('#btnSaveNote')?.addEventListener('click', async () => {
    const p = state.projects.find((pr) => pr.id === project.id);
    p.notes = { ...p.notes, [stageId]: $('#stageNoteInput').value.trim() };
    addActivity(p, 'note', `Catatan diperbarui — Tahap ${stageId}`);
    await saveProject(p);
    await window.api.info('Tersimpan', 'Catatan tahap berhasil disimpan.');
  });

  $('#btnSaveChecklist')?.addEventListener('click', async () => {
    const p = state.projects.find((pr) => pr.id === project.id);
    const updated = { ...p.checklists[stageId] };
    modal.querySelectorAll('#stageChecklist input[type="checkbox"]').forEach((cb) => {
      updated[cb.dataset.deliverable] = cb.checked;
    });
    p.checklists = { ...p.checklists, [stageId]: updated };
    const done = Object.values(updated).filter(Boolean).length;
    addActivity(p, 'checklist', `Checklist Tahap ${stageId}: ${done}/${Object.keys(updated).length} selesai`);
    await saveProject(p);
    await window.api.info('Tersimpan', 'Checklist deliverables berhasil disimpan.');
  });

  $('#btnUploadDoc')?.addEventListener('click', async () => {
    const uploaded = await window.api.uploadDocuments(project.id, stageId);
    if (!uploaded.length) return;

    const p = state.projects.find((pr) => pr.id === project.id);
    const existing = p.documents?.[stageId] ?? [];
    p.documents = { ...p.documents, [stageId]: [...existing, ...uploaded] };
    addActivity(p, 'upload', `${uploaded.length} dokumen diunggah — Tahap ${stageId}`);
    await saveProject(p);
    openStageManageModal(project.id, stageId);
  });

  modal.querySelectorAll('.btn-open-doc').forEach((btn) => {
    btn.addEventListener('click', () => window.api.openDocument(btn.dataset.path));
  });

  modal.querySelectorAll('.btn-delete-doc').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const ok = await window.api.confirm('Hapus dokumen ini?');
      if (!ok) return;

      await window.api.deleteDocument(btn.dataset.path);
      const p = state.projects.find((pr) => pr.id === project.id);
      p.documents = {
        ...p.documents,
        [stageId]: (p.documents[stageId] ?? []).filter((d) => d.id !== btn.dataset.id),
      };
      addActivity(p, 'upload', `Dokumen dihapus — Tahap ${stageId}`);
      await saveProject(p);
      openStageManageModal(project.id, stageId);
    });
  });

  $('#btnOpenRabFromStage')?.addEventListener('click', () => {
    $('#stageModal').classList.add('hidden');
    goToRab(project.id);
  });

  $('#btnExportRabFromStage')?.addEventListener('click', async () => {
    const p = state.projects.find((pr) => pr.id === project.id);
    if (!p.rab?.items?.length) {
      await window.api.info('Export RAB', 'Buat RAB terlebih dahulu dari menu RAB / BoQ.');
      return;
    }
    await exportRabPdf(p);
  });

  $('#btnExportTenderFromStage')?.addEventListener('click', async () => {
    const p = state.projects.find((pr) => pr.id === project.id);
    if (!p.rab?.items?.length) {
      await window.api.info('Paket Pengadaan', 'Buat RAB terlebih dahulu.');
      return;
    }
    await exportTenderPdf(p);
  });
}

function openSupervisionModal(projectId) {
  $('#supervisionProjectId').value = projectId;
  $('#supervisionDate').value = new Date().toISOString().slice(0, 10);
  $('#supervisionAttendees').value = '';
  $('#supervisionFindings').value = '';
  $('#supervisionRecommendations').value = '';
  $('#supervisionModal').classList.remove('hidden');
}

function closeSupervisionModal() {
  $('#supervisionModal').classList.add('hidden');
  $('#supervisionForm').reset();
}

async function handleSupervisionSubmit(e) {
  e.preventDefault();
  const projectId = $('#supervisionProjectId').value;
  const p = state.projects.find((pr) => pr.id === projectId);
  if (!p) return;

  const report = {
    id: Date.now().toString(),
    date: $('#supervisionDate').value,
    findings: $('#supervisionFindings').value.trim(),
    recommendations: $('#supervisionRecommendations').value.trim(),
    attendees: $('#supervisionAttendees').value.trim(),
    createdAt: new Date().toISOString(),
  };

  p.supervisionReports = [report, ...(p.supervisionReports ?? [])];
  addActivity(p, 'supervision', `Laporan pengawasan ${formatDate(report.date)}`);
  await saveProject(p);
  closeSupervisionModal();
  state.selectedProject = projectId;
  render();
}

function renderActivityItem(a) {
  const labels = {
    create: 'Proyek dibuat',
    approve: 'Persetujuan tahap',
    submit: 'Pengajuan persetujuan',
    upload: 'Dokumen',
    note: 'Catatan',
    checklist: 'Checklist',
    supervision: 'Pengawasan',
    export: 'Export',
    rab: 'RAB / BoQ',
  };
  return `
    <li class="activity-item ${a.action}">
      <div class="activity-dot"></div>
      <div>
        <strong style="font-size:13px">${labels[a.action] ?? a.action}</strong>
        <div class="activity-detail">${a.detail}</div>
        <div class="activity-time">${formatDate(a.timestamp)}</div>
      </div>
    </li>`;
}

function renderActivity() {
  const q = state.searchQuery;
  const allActivities = state.projects.flatMap((p) =>
    (p.activityLog ?? []).map((a) => ({ ...a, projectName: p.name, projectId: p.id }))
  ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const filtered = allActivities.filter((a) =>
    !q ||
    a.detail.toLowerCase().includes(q) ||
    a.projectName.toLowerCase().includes(q)
  );

  content.innerHTML = `
    <div class="page-header">
      <h2>Log Aktivitas</h2>
      <p>Riwayat semua aktivitas proyek — persetujuan, dokumen, pengawasan, dan lainnya.</p>
    </div>
    ${filtered.length === 0 ? `
      <div class="empty-state">
        <div class="empty-icon">◷</div>
        <h3>Belum ada aktivitas</h3>
        <p>Aktivitas akan muncul saat Anda mengelola proyek.</p>
      </div>
    ` : `
      <ul class="activity-list">
        ${filtered.map((a) => `
          <li class="activity-item ${a.action}">
            <div class="activity-dot"></div>
            <div style="flex:1">
              <strong style="font-size:13px">${a.projectName}</strong>
              <div class="activity-detail">${highlight(a.detail, q)}</div>
              <div class="activity-time">${formatDate(a.timestamp)}</div>
            </div>
            <button class="btn btn-sm btn-ghost btn-goto-project" data-id="${a.projectId}">Lihat Proyek</button>
          </li>
        `).join('')}
      </ul>
    `}
  `;

  content.querySelectorAll('.btn-goto-project').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.view = 'projects';
      state.selectedProject = btn.dataset.id;
      document.querySelectorAll('.nav-item').forEach((b) => b.classList.remove('active'));
      document.querySelector('[data-view="projects"]').classList.add('active');
      render();
    });
  });
}

function openStageDetail(stageId) {
  openStageManageModal(state.selectedProject, stageId);
}

function goToRab(projectId) {
  state.view = 'rab';
  state.selectedRabProject = projectId;
  document.querySelectorAll('.nav-item').forEach((b) => b.classList.remove('active'));
  document.querySelector('[data-view="rab"]')?.classList.add('active');
  render();
}

function renderRab() {
  content.innerHTML = renderRabView(state, {});
  bindRabEvents();
}

function bindRabEvents() {
  content.querySelectorAll('.rab-project-card, [data-rab-project]').forEach((el) => {
    el.addEventListener('click', (e) => {
      if (e.target.closest('button')) return;
      state.selectedRabProject = el.dataset.rabProject;
      render();
    });
    el.querySelector('button')?.addEventListener('click', (e) => {
      e.stopPropagation();
      state.selectedRabProject = el.dataset.rabProject;
      render();
    });
  });

  $('#btnBackRab')?.addEventListener('click', () => {
    state.selectedRabProject = null;
    render();
  });

  if (!state.selectedRabProject) return;

  const projectId = state.selectedRabProject;

  $('#btnSaveDesign')?.addEventListener('click', async () => {
    const p = state.projects.find((pr) => pr.id === projectId);
    p.design = collectDesignFromDom();
    addActivity(p, 'note', 'Data desain diperbarui');
    await saveProject(p);
    await window.api.info('Tersimpan', 'Data desain proyek disimpan.');
  });

  $('#btnGenTemplate')?.addEventListener('click', async () => {
    const p = state.projects.find((pr) => pr.id === projectId);
    if (!p.design?.luasBangunan) {
      const ok = await window.api.confirm('Luas bangunan belum diisi. Generate template dengan volume manual?');
      if (!ok) return;
    }
    const existing = p.rab?.items?.length ?? 0;
    if (existing > 0) {
      const ok = await window.api.confirm('RAB sudah memiliki item. Ganti dengan template baru?');
      if (!ok) return;
    }
    p.rab = {
      ...(p.rab ?? createEmptyRab()),
      items: generateRabFromTemplate(p.specialization, p.design ?? {}),
      updatedAt: new Date().toISOString(),
    };
    addActivity(p, 'rab', `RAB digenerate dari template ${getSpecLabel(p.specialization)}`);
    await saveProject(p);
    render();
  });

  $('#btnRecalcVolume')?.addEventListener('click', async () => {
    const p = state.projects.find((pr) => pr.id === projectId);
    p.design = collectDesignFromDom();
    p.rab.items = recalcVolumesFromDesign(p.rab.items, p.design);
    addActivity(p, 'rab', 'Volume RAB dihitung ulang dari data desain');
    await saveProject(p);
    render();
  });

  $('#btnAddRabItem')?.addEventListener('click', async () => {
    await persistRabFromDom(projectId);
    const p = state.projects.find((pr) => pr.id === projectId);
    p.rab.items.push({
      id: `item-${Date.now()}`,
      category: 'A',
      pekerjaan: 'Pekerjaan baru',
      volume: 0,
      satuan: 'm2',
      hargaSatuan: 0,
      linkedStage: 4,
    });
    await saveProject(p);
    render();
  });

  $('#btnSaveRab')?.addEventListener('click', () => persistRabFromDom(projectId, true));

  $('#btnExportRabPdf')?.addEventListener('click', async () => {
    await persistRabFromDom(projectId);
    const p = state.projects.find((pr) => pr.id === projectId);
    if (!p.rab?.items?.length) {
      await window.api.info('Export RAB', 'Tambahkan item RAB terlebih dahulu.');
      return;
    }
    await exportRabPdf(p);
  });

  $('#btnExportRabCsv')?.addEventListener('click', async () => {
    await persistRabFromDom(projectId);
    const p = state.projects.find((pr) => pr.id === projectId);
    if (!p.rab?.items?.length) {
      await window.api.info('Export CSV', 'Tambahkan item RAB terlebih dahulu.');
      return;
    }
    await exportRabCsv(p);
  });

  $('#btnExportTender')?.addEventListener('click', async () => {
    await persistRabFromDom(projectId);
    const p = state.projects.find((pr) => pr.id === projectId);
    if (!p.rab?.items?.length) {
      await window.api.info('Paket Pengadaan', 'Tambahkan item RAB terlebih dahulu.');
      return;
    }
    await exportTenderPdf(p);
  });

  content.querySelectorAll('.rab-del-item').forEach((btn) => {
    btn.addEventListener('click', async () => {
      await persistRabFromDom(projectId);
      const p = state.projects.find((pr) => pr.id === projectId);
      p.rab.items = p.rab.items.filter((it) => it.id !== btn.dataset.id);
      await saveProject(p);
      render();
    });
  });

  content.querySelectorAll('.rab-input').forEach((inp) => {
    inp.addEventListener('change', () => updateRabSummaryLive(projectId));
    inp.addEventListener('input', () => {
      if (inp.dataset.field === 'volume' || inp.dataset.field === 'hargaSatuan') {
        updateRabRowTotal(inp);
        updateRabSummaryLive(projectId);
      }
    });
  });

  content.querySelectorAll('.rab-setting').forEach((inp) => {
    inp.addEventListener('input', () => updateRabSummaryLive(projectId));
  });
}

async function persistRabFromDom(projectId, showInfo = false) {
  const p = state.projects.find((pr) => pr.id === projectId);
  if (!p) return;
  p.rab = collectRabFromDom(p);
  if (document.getElementById('designLuasBangunan')) {
    p.design = collectDesignFromDom();
  }
  if (p.rab.items.length > 0) {
    p.checklists = p.checklists ?? {};
    p.checklists[4] = p.checklists[4] ?? {};
    p.checklists[4]['RAB & BoQ'] = true;
    if (document.getElementById('syncBudgetFromRab')?.checked) {
      const summary = calcRabSummary(p.rab);
      p.budget = Math.round(summary.grandTotal);
    }
  }
  addActivity(p, 'rab', `RAB disimpan — ${p.rab.items.length} item`);
  await saveProject(p);
  if (showInfo) await window.api.info('Tersimpan', 'RAB berhasil disimpan dan terhubung ke proyek.');
}

function updateRabRowTotal(input) {
  const row = input.closest('.rab-item-row');
  if (!row) return;
  const vol = parseFloat(row.querySelector('[data-field="volume"]')?.value) || 0;
  const harga = parseFloat(row.querySelector('[data-field="hargaSatuan"]')?.value) || 0;
  const cell = row.querySelector('.rab-jumlah');
  if (cell) cell.textContent = formatRupiah(vol * harga);
}

function updateRabSummaryLive(projectId) {
  const p = state.projects.find((pr) => pr.id === projectId);
  if (!p) return;
  const rab = collectRabFromDom(p);
  const summary = calcRabSummary(rab);
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = formatRupiah(val); };
  set('sumSubtotal', summary.subtotal);
  set('sumOverhead', summary.overhead);
  set('sumProfit', summary.profit);
  set('sumContingency', summary.contingency);
  set('sumPpn', summary.ppn);
  set('sumGrand', summary.grandTotal);
}

function openProjectModal(project = null) {
  $('#modalTitle').textContent = project ? 'Edit Proyek' : 'Proyek Baru';
  $('#projectId').value = project?.id ?? '';
  $('#projectName').value = project?.name ?? '';
  $('#clientName').value = project?.clientName ?? '';
  $('#specialization').value = project?.specialization ?? 'perumahan';
  $('#location').value = project?.location ?? '';
  $('#budget').value = project?.budget ?? '';
  $('#description').value = project?.description ?? '';
  const d = project?.design ?? {};
  $('#luasBangunan').value = d.luasBangunan ?? '';
  $('#luasTapak').value = d.luasTapak ?? '';
  $('#jumlahLantai').value = d.jumlahLantai ?? 1;
  $('#tipeStruktur').value = d.tipeStruktur ?? 'beton bertulang';
  $('#projectModal').classList.remove('hidden');
}

function closeProjectModal() {
  $('#projectModal').classList.add('hidden');
  $('#projectForm').reset();
}

async function handleProjectSubmit(e) {
  e.preventDefault();

  const design = {
    luasBangunan: parseFloat($('#luasBangunan').value) || null,
    luasTapak: parseFloat($('#luasTapak').value) || null,
    jumlahLantai: parseInt($('#jumlahLantai').value, 10) || 1,
    tinggiLantai: 3,
    tipeStruktur: $('#tipeStruktur').value,
  };

  const data = {
    name: $('#projectName').value.trim(),
    clientName: $('#clientName').value.trim(),
    specialization: $('#specialization').value,
    location: $('#location').value.trim(),
    budget: parseInt($('#budget').value, 10) || null,
    description: $('#description').value.trim(),
    design,
  };

  const id = $('#projectId').value;

  if (id) {
    const existing = state.projects.find((p) => p.id === id);
    const updated = await window.api.updateProject({ ...existing, ...data, design: { ...existing.design, ...design } });
    state.projects = state.projects.map((p) => (p.id === updated.id ? migrateProject(updated) : p));
  } else {
    const created = await window.api.createProject(data);
    state.projects.push(migrateProject(created));
  }

  closeProjectModal();
  state.view = 'projects';
  document.querySelectorAll('.nav-item').forEach((b) => b.classList.remove('active'));
  document.querySelector('[data-view="projects"]').classList.add('active');
  render();
}

window.__goTahap = (id) => {
  state.view = 'tahapan';
  state.selectedTahap = id;
  document.querySelectorAll('.nav-item').forEach((b) => b.classList.remove('active'));
  document.querySelector('[data-view="tahapan"]').classList.add('active');
  render();
};

window.__newProject = () => openProjectModal();

init();
