const { app, BrowserWindow, ipcMain, dialog, shell, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const { buildProjectReportHtml, buildRabReportHtml, buildTenderPackageHtml } = require('./report-builder');
const { buildRabCsv } = require('./csv-export');

const DATA_DIR = path.join(app.getPath('userData'), 'projects');
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json');
const DOCS_ROOT = path.join(app.getPath('userData'), 'documents');
const SETTINGS_FILE = path.join(app.getPath('userData'), 'settings.json');

let mainWindow = null;

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DOCS_ROOT)) fs.mkdirSync(DOCS_ROOT, { recursive: true });
  if (!fs.existsSync(PROJECTS_FILE)) {
    fs.writeFileSync(PROJECTS_FILE, JSON.stringify([], null, 2));
  }
  if (!fs.existsSync(SETTINGS_FILE)) {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify({ welcomeShown: false }, null, 2));
  }
}

function readSettings() {
  ensureDataDir();
  return JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8'));
}

function writeSettings(settings) {
  ensureDataDir();
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
}

function getProjectDocsDir(projectId) {
  const dir = path.join(DOCS_ROOT, projectId);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function readProjects() {
  ensureDataDir();
  return JSON.parse(fs.readFileSync(PROJECTS_FILE, 'utf-8'));
}

function writeProjects(projects) {
  ensureDataDir();
  fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2));
}

function initDefaultChecklists() {
  const { TAHAPAN_DATA } = require('./report-data');
  const checklists = {};
  TAHAPAN_DATA.forEach((t) => {
    checklists[t.id] = {};
    t.deliverables.forEach((d) => { checklists[t.id][d.name] = false; });
  });
  return checklists;
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 960,
    minHeight: 640,
    title: 'Buat Kamu — Manajemen Pekerjaan Arsitek',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    show: false,
    backgroundColor: '#0f1419',
  });

  mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'));
  mainWindow.once('ready-to-show', () => mainWindow.show());
}

function buildMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Proyek Baru',
          accelerator: 'CmdOrCtrl+N',
          click: () => mainWindow?.webContents.send('menu:newProject'),
        },
        { type: 'separator' },
        {
          label: 'Export Laporan PDF',
          accelerator: 'CmdOrCtrl+E',
          click: () => mainWindow?.webContents.send('menu:exportPdf'),
        },
        {
          label: 'Export RAB PDF',
          accelerator: 'CmdOrCtrl+R',
          click: () => mainWindow?.webContents.send('menu:exportRabPdf'),
        },
        {
          label: 'Export RAB CSV (Excel)',
          click: () => mainWindow?.webContents.send('menu:exportRabCsv'),
        },
        {
          label: 'Export Paket Pengadaan PDF',
          click: () => mainWindow?.webContents.send('menu:exportTender'),
        },
        { type: 'separator' },
        {
          label: 'Backup Data',
          click: () => mainWindow?.webContents.send('menu:backup'),
        },
        {
          label: 'Restore Data',
          click: () => mainWindow?.webContents.send('menu:restore'),
        },
        { role: 'quit', label: 'Keluar' },
      ],
    },
    {
      label: 'Tampilan',
      submenu: [
        { role: 'reload', label: 'Muat Ulang' },
        { role: 'toggleDevTools', label: 'Developer Tools' },
        { type: 'separator' },
        { role: 'resetZoom', label: 'Zoom Normal' },
        { role: 'zoomIn', label: 'Perbesar' },
        { role: 'zoomOut', label: 'Perkecil' },
      ],
    },
    {
      label: 'Bantuan',
      submenu: [
        {
          label: 'Tentang Buat Kamu',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Tentang Buat Kamu',
              message: 'Buat Kamu v2.0.0',
              detail: 'Manajemen pekerjaan arsitek lengkap.\n6 Tahapan · RAB/BoQ · Desain · Dokumen · Pengawasan · Export PDF · Backup',
            });
          },
        },
      ],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

app.whenReady().then(() => {
  ensureDataDir();
  createWindow();
  buildMenu();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// --- Projects ---

ipcMain.handle('projects:getAll', () => readProjects());

function initDefaultRab() {
  return { items: [], settings: { ppnPercent: 11, contingencyPercent: 5, overheadPercent: 10, profitPercent: 6 }, updatedAt: null };
}

function initDefaultDesign() {
  return { luasBangunan: null, luasTapak: null, jumlahLantai: 1, tinggiLantai: 3, tipeStruktur: 'beton bertulang' };
}

ipcMain.handle('projects:create', (_, project) => {
  const projects = readProjects();
  const newProject = {
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    currentStage: 1,
    stageStatus: { 1: 'active', 2: 'locked', 3: 'locked', 4: 'locked', 5: 'locked', 6: 'locked' },
    approvals: {},
    notes: {},
    documents: {},
    checklists: initDefaultChecklists(),
    supervisionReports: [],
    rab: initDefaultRab(),
    design: initDefaultDesign(),
    activityLog: [{
      action: 'create',
      detail: 'Proyek dibuat',
      timestamp: new Date().toISOString(),
    }],
    ...project,
  };
  projects.push(newProject);
  writeProjects(projects);
  getProjectDocsDir(newProject.id);
  return newProject;
});

ipcMain.handle('projects:update', (_, updated) => {
  const projects = readProjects();
  const idx = projects.findIndex((p) => p.id === updated.id);
  if (idx === -1) return null;
  projects[idx] = { ...projects[idx], ...updated, updatedAt: new Date().toISOString() };
  writeProjects(projects);
  return projects[idx];
});

ipcMain.handle('projects:delete', (_, id) => {
  const projects = readProjects().filter((p) => p.id !== id);
  writeProjects(projects);
  const docsDir = path.join(DOCS_ROOT, id);
  if (fs.existsSync(docsDir)) fs.rmSync(docsDir, { recursive: true, force: true });
  return true;
});

// --- Documents ---

ipcMain.handle('documents:upload', async (_, { projectId, stageId }) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Pilih Dokumen',
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'Semua File', extensions: ['*'] },
      { name: 'PDF & Gambar', extensions: ['pdf', 'png', 'jpg', 'jpeg', 'dwg', 'dxf'] },
      { name: 'Dokumen Office', extensions: ['doc', 'docx', 'xls', 'xlsx'] },
    ],
  });

  if (result.canceled || !result.filePaths.length) return [];

  const docsDir = getProjectDocsDir(projectId);
  const stageDir = path.join(docsDir, String(stageId));
  if (!fs.existsSync(stageDir)) fs.mkdirSync(stageDir, { recursive: true });

  const uploaded = [];
  for (const srcPath of result.filePaths) {
    const originalName = path.basename(srcPath);
    const docId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const destName = `${docId}${path.extname(originalName)}`;
    const destPath = path.join(stageDir, destName);
    fs.copyFileSync(srcPath, destPath);

    uploaded.push({
      id: docId,
      originalName,
      storedName: destName,
      path: destPath,
      size: fs.statSync(destPath).size,
      uploadedAt: new Date().toISOString(),
    });
  }
  return uploaded;
});

ipcMain.handle('documents:open', async (_, filePath) => {
  if (fs.existsSync(filePath)) {
    await shell.openPath(filePath);
    return true;
  }
  return false;
});

ipcMain.handle('documents:delete', async (_, { filePath }) => {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return true;
  }
  return false;
});

// --- Export PDF ---

async function exportHtmlToPdf(html, defaultPath, title) {
  const { filePath, canceled } = await dialog.showSaveDialog(mainWindow, {
    title,
    defaultPath,
    filters: [{ name: 'PDF', extensions: ['pdf'] }],
  });
  if (canceled || !filePath) return null;

  const printWin = new BrowserWindow({ show: false, webPreferences: { offscreen: true } });
  try {
    await printWin.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
    const pdfData = await printWin.webContents.printToPDF({
      printBackground: true,
      margins: { top: 0.5, bottom: 0.5, left: 0.5, right: 0.5 },
    });
    fs.writeFileSync(filePath, pdfData);
    return filePath;
  } finally {
    printWin.destroy();
  }
}

ipcMain.handle('export:pdf', async (_, project) => {
  const html = buildProjectReportHtml(project);
  return exportHtmlToPdf(html, `Laporan-${project.name.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`, 'Simpan Laporan PDF');
});

ipcMain.handle('export:rabPdf', async (_, project) => {
  const html = buildRabReportHtml(project);
  return exportHtmlToPdf(html, `RAB-${project.name.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`, 'Simpan RAB PDF');
});

ipcMain.handle('export:rabCsv', async (_, project) => {
  const { filePath, canceled } = await dialog.showSaveDialog(mainWindow, {
    title: 'Simpan RAB CSV',
    defaultPath: `RAB-${project.name.replace(/[^a-zA-Z0-9]/g, '-')}.csv`,
    filters: [{ name: 'CSV (Excel)', extensions: ['csv'] }],
  });
  if (canceled || !filePath) return null;
  fs.writeFileSync(filePath, '\uFEFF' + buildRabCsv(project), 'utf-8');
  return filePath;
});

ipcMain.handle('export:tenderPdf', async (_, project) => {
  const html = buildTenderPackageHtml(project);
  return exportHtmlToPdf(html, `Pengadaan-${project.name.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`, 'Simpan Paket Pengadaan PDF');
});

ipcMain.handle('settings:get', () => readSettings());
ipcMain.handle('settings:set', (_, settings) => {
  writeSettings({ ...readSettings(), ...settings });
  return readSettings();
});

// --- Backup & Restore ---

ipcMain.handle('backup:export', async () => {
  const { filePath, canceled } = await dialog.showSaveDialog(mainWindow, {
    title: 'Simpan Backup',
    defaultPath: `BuatKamu-backup-${new Date().toISOString().slice(0, 10)}.json`,
    filters: [{ name: 'JSON Backup', extensions: ['json'] }],
  });
  if (canceled || !filePath) return null;

  const backup = {
    version: '2.0.0',
    exportedAt: new Date().toISOString(),
    projects: readProjects(),
  };
  fs.writeFileSync(filePath, JSON.stringify(backup, null, 2));
  return filePath;
});

ipcMain.handle('backup:import', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Pilih File Backup',
    filters: [{ name: 'JSON Backup', extensions: ['json'] }],
    properties: ['openFile'],
  });
  if (result.canceled || !result.filePaths.length) return null;

  const raw = JSON.parse(fs.readFileSync(result.filePaths[0], 'utf-8'));
  const projects = raw.projects ?? raw;
  if (!Array.isArray(projects)) return { error: 'Format backup tidak valid.' };

  const confirm = await dialog.showMessageBox(mainWindow, {
    type: 'warning',
    buttons: ['Batal', 'Restore'],
    defaultId: 1,
    cancelId: 0,
    title: 'Restore Backup',
    message: `Restore ${projects.length} proyek? Data saat ini akan diganti.`,
  });
  if (confirm.response !== 1) return null;

  writeProjects(projects);
  return { count: projects.length };
});

// --- Dialog ---

ipcMain.handle('dialog:confirm', async (_, message) => {
  const result = await dialog.showMessageBox(mainWindow, {
    type: 'question',
    buttons: ['Batal', 'Ya'],
    defaultId: 1,
    cancelId: 0,
    title: 'Konfirmasi',
    message,
  });
  return result.response === 1;
});

ipcMain.handle('dialog:info', async (_, { title, message }) => {
  await dialog.showMessageBox(mainWindow, { type: 'info', title, message });
});
