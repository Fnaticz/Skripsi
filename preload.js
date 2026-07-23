const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  getProjects: () => ipcRenderer.invoke('projects:getAll'),
  createProject: (project) => ipcRenderer.invoke('projects:create', project),
  updateProject: (project) => ipcRenderer.invoke('projects:update', project),
  deleteProject: (id) => ipcRenderer.invoke('projects:delete', id),
  confirm: (message) => ipcRenderer.invoke('dialog:confirm', message),
  info: (title, message) => ipcRenderer.invoke('dialog:info', { title, message }),

  uploadDocuments: (projectId, stageId) =>
    ipcRenderer.invoke('documents:upload', { projectId, stageId }),
  openDocument: (filePath) => ipcRenderer.invoke('documents:open', filePath),
  deleteDocument: (filePath) => ipcRenderer.invoke('documents:delete', { filePath }),

  exportPdf: (project) => ipcRenderer.invoke('export:pdf', project),
  exportRabPdf: (project) => ipcRenderer.invoke('export:rabPdf', project),
  exportRabCsv: (project) => ipcRenderer.invoke('export:rabCsv', project),
  exportTenderPdf: (project) => ipcRenderer.invoke('export:tenderPdf', project),

  backupExport: () => ipcRenderer.invoke('backup:export'),
  backupImport: () => ipcRenderer.invoke('backup:import'),

  getSettings: () => ipcRenderer.invoke('settings:get'),
  setSettings: (settings) => ipcRenderer.invoke('settings:set', settings),

  onMenu: (channel, callback) => {
    ipcRenderer.on(channel, callback);
    return () => ipcRenderer.removeListener(channel, callback);
  },
});
