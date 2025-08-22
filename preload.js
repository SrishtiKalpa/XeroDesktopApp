const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Store operations
  getStoreValue: (key) => ipcRenderer.invoke('get-store-value', key),
  setStoreValue: (key, value) => ipcRenderer.invoke('set-store-value', key, value),
  
  // Database operations
  getDatabaseData: (table, query) => ipcRenderer.invoke('get-database-data', table, query),
  saveDatabaseData: (table, data) => ipcRenderer.invoke('save-database-data', table, data),
  
  // Offline data operations
  getOfflineData: (table) => ipcRenderer.invoke('get-offline-data', table),
  saveOfflineData: (table, data) => ipcRenderer.invoke('save-offline-data', table, data),
  
  // Sync operations
  syncData: (data) => ipcRenderer.invoke('sync-data', data),
  checkConnection: () => ipcRenderer.invoke('check-connection'),
  
  // Notifications
  showNotification: (title, body) => ipcRenderer.invoke('show-notification', title, body),
  
  // Update operations
  installUpdate: () => ipcRenderer.invoke('install-update'),
  
  // External operations
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  
  // Event listeners
  onUpdateAvailable: (callback) => ipcRenderer.on('update-available', callback),
  onUpdateDownloaded: (callback) => ipcRenderer.on('update-downloaded', callback),
  onMenuAction: (callback) => ipcRenderer.on('menu-action', callback),
  
  // Remove event listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
  
  // Platform info
  platform: process.platform,
  
  // App version
  appVersion: process.env.npm_package_version || '1.0.0'
});

// Handle window focus/blur for better UX
window.addEventListener('focus', () => {
  ipcRenderer.send('window-focused');
});

window.addEventListener('blur', () => {
  ipcRenderer.send('window-blurred');
});

// Handle keyboard shortcuts
document.addEventListener('keydown', (event) => {
  // Cmd/Ctrl + S for sync
  if ((event.metaKey || event.ctrlKey) && event.key === 's') {
    event.preventDefault();
    ipcRenderer.send('menu-action', 'sync-now');
  }
  
  // Cmd/Ctrl + N for new invoice
  if ((event.metaKey || event.ctrlKey) && event.key === 'n' && !event.shiftKey) {
    event.preventDefault();
    ipcRenderer.send('menu-action', 'new-invoice');
  }
  
  // Cmd/Ctrl + Shift + N for new bill
  if ((event.metaKey || event.ctrlKey) && event.key === 'N') {
    event.preventDefault();
    ipcRenderer.send('menu-action', 'new-bill');
  }
});
