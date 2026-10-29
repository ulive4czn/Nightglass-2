const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('nightglass', {
  newTab: url => ipcRenderer.invoke('browser:new-tab', url),
  activateTab: id => ipcRenderer.invoke('browser:activate-tab', id),
  closeTab: id => ipcRenderer.invoke('browser:close-tab', id),
  navigate: value => ipcRenderer.invoke('browser:navigate', value),
  back: () => ipcRenderer.invoke('browser:back'),
  forward: () => ipcRenderer.invoke('browser:forward'),
  reload: () => ipcRenderer.invoke('browser:reload'),
  home: () => ipcRenderer.invoke('browser:home'),
  clearSession: () => ipcRenderer.invoke('browser:clear-session'),
  onState: callback => ipcRenderer.on('browser:state', (_event, state) => callback(state))
});
