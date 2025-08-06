const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  showMessage: (type, title, message) => ipcRenderer.invoke('show-message', type, title, message),
  openFolder: (folderPath) => ipcRenderer.invoke('open-folder', folderPath),
  organizeFiles: (sourceDir, destinationDir, prefix) => 
    ipcRenderer.invoke('organize-files', sourceDir, destinationDir, prefix),
  organizeMultiFiles: (sourceDirs, destinationDir, prefix) => 
    ipcRenderer.invoke('organize-multi-files', sourceDirs, destinationDir, prefix)
});