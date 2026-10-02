const { contextBridge, ipcRenderer } = require('electron')

// Minimal, safe bridge for the custom title-bar window controls.
contextBridge.exposeInMainWorld('momentum', {
  minimize: () => ipcRenderer.send('win:minimize'),
  toggleMaximize: () => ipcRenderer.send('win:toggle-maximize'),
  close: () => ipcRenderer.send('win:close'),
  isElectron: true,
})
