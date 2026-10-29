const { app, BrowserWindow, WebContentsView, ipcMain, session, shell } = require('electron');
const path = require('path');

let win;
let browserSession;
let tabs = [];
let activeTabId = null;
let nextTabId = 1;
let quitting = false;

const TRACKER_HOSTS = [
  'doubleclick.net', 'googlesyndication.com', 'google-analytics.com',
  'googletagmanager.com', 'facebook.net', 'connect.facebook.net',
  'analytics.tiktok.com', 'bat.bing.com', 'hotjar.com',
  'mixpanel.com', 'segment.io', 'segment.com', 'scorecardresearch.com',
  'adsrvr.org', 'adnxs.com', 'criteo.com', 'taboola.com', 'outbrain.com'
];

function isTracker(url) {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return TRACKER_HOSTS.some(domain => host === domain || host.endsWith('.' + domain));
  } catch { return false; }
}

function normalizeAddress(input) {
  const value = String(input || '').trim();
  if (!value) return 'https://duckduckgo.com/';
  if (/^(javascript|data|file|vbscript):/i.test(value)) return 'https://duckduckgo.com/';
  if (/^https?:\/\//i.test(value)) return value;
  if (/^(localhost|127\.0\.0\.1)(:\d+)?([/?#].*)?$/i.test(value)) return 'http://' + value;
  if (/^[^\s]+\.[^\s]+$/.test(value) && !value.includes(' ')) return 'https://' + value;
  return 'https://duckduckgo.com/?q=' + encodeURIComponent(value);
}

function sendState() {
  if (!win || win.isDestroyed()) return;
  const current = tabs.find(t => t.id === activeTabId);
  win.webContents.send('browser:state', {
    tabs: tabs.map(t => ({
      id: t.id,
      title: t.view.webContents.getTitle() || 'New tab',
      url: t.view.webContents.getURL() || '',
      loading: t.view.webContents.isLoading(),
      canGoBack: t.view.webContents.navigationHistory.canGoBack(),
      canGoForward: t.view.webContents.navigationHistory.canGoForward()
    })),
    activeTabId,
    current: current ? {
      title: current.view.webContents.getTitle() || 'New tab',
      url: current.view.webContents.getURL() || '',
      loading: current.view.webContents.isLoading(),
      canGoBack: current.view.webContents.navigationHistory.canGoBack(),
      canGoForward: current.view.webContents.navigationHistory.canGoForward()
    } : null
  });
}

function setViewBounds() {
  if (!win) return;
  const [width, height] = win.getContentSize();
  const active = tabs.find(t => t.id === activeTabId);
  if (active) active.view.setBounds({ x: 0, y: 136, width, height: Math.max(0, height - 136) });
}

function attachTabEvents(tab) {
  const wc = tab.view.webContents;
  wc.setWindowOpenHandler(({ url }) => {
    createTab(url);
    return { action: 'deny' };
  });
  wc.on('will-navigate', (event, url) => {
    if (!/^https?:\/\//i.test(url)) {
      event.preventDefault();
      return;
    }
  });
  wc.on('did-start-loading', sendState);
  wc.on('did-stop-loading', sendState);
  wc.on('page-title-updated', sendState);
  wc.on('did-navigate', sendState);
  wc.on('did-navigate-in-page', sendState);
  wc.on('render-process-gone', () => sendState());
}

function createTab(address = 'https://duckduckgo.com/') {
  const id = nextTabId++;
  const view = new WebContentsView({
    webPreferences: {
      session: browserSession,
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
      allowRunningInsecureContent: false
    }
  });
  const tab = { id, view };
  tabs.push(tab);
  attachTabEvents(tab);
  activateTab(id);
  view.webContents.loadURL(normalizeAddress(address)).catch(() => {});
  sendState();
  return id;
}

function activateTab(id) {
  const next = tabs.find(t => t.id === id);
  if (!next || !win) return;
  const previous = tabs.find(t => t.id === activeTabId);
  if (previous && previous !== next) win.contentView.removeChildView(previous.view);
  activeTabId = id;
  if (!win.contentView.children.includes(next.view)) win.contentView.addChildView(next.view);
  setViewBounds();
  sendState();
}

function closeTab(id) {
  const index = tabs.findIndex(t => t.id === id);
  if (index < 0) return;
  const [tab] = tabs.splice(index, 1);
  if (win && !win.isDestroyed() && win.contentView.children.includes(tab.view)) {
    win.contentView.removeChildView(tab.view);
  }
  tab.view.webContents.close();
  if (!tabs.length) {
    createTab();
  } else if (activeTabId === id) {
    activateTab(tabs[Math.max(0, index - 1)].id);
  }
  sendState();
}

function createWindow() {
  win = new BrowserWindow({
    width: 1280, height: 850, minWidth: 800, minHeight: 560,
    backgroundColor: '#101113',
    title: 'Nightglass Browser',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });
  win.loadFile(path.join(__dirname, 'app', 'index.html'));
  win.on('resize', setViewBounds);
  win.on('closed', () => { win = null; });
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
}

app.whenReady().then(() => {
  // No "persist:" prefix: cookies, cache and local storage live only for this app session.
  browserSession = session.fromPartition('nightglass-ephemeral');
  browserSession.webRequest.onBeforeRequest((details, callback) => {
    if (isTracker(details.url)) return callback({ cancel: true });
    callback({});
  });
  browserSession.setPermissionRequestHandler((_wc, permission, callback) => {
    // Deny sensitive permissions by default. Users can still use normal page features.
    const allowed = ['fullscreen'];
    callback(allowed.includes(permission));
  });
  browserSession.on('will-download', (_event, item) => {
    // Downloads are allowed, but ask where to save each file.
    item.setSaveDialogOptions({ title: 'Save download' });
  });
  createWindow();
  createTab();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) { createWindow(); createTab(); } });
});

ipcMain.handle('browser:new-tab', (_e, url) => createTab(url || 'https://duckduckgo.com/'));
ipcMain.handle('browser:activate-tab', (_e, id) => activateTab(Number(id)));
ipcMain.handle('browser:close-tab', (_e, id) => closeTab(Number(id)));
ipcMain.handle('browser:navigate', (_e, input) => {
  const tab = tabs.find(t => t.id === activeTabId);
  if (tab) return tab.view.webContents.loadURL(normalizeAddress(input)).catch(() => {});
});
ipcMain.handle('browser:back', () => {
  const t = tabs.find(t => t.id === activeTabId);
  if (t && t.view.webContents.navigationHistory.canGoBack()) t.view.webContents.navigationHistory.goBack();
});
ipcMain.handle('browser:forward', () => {
  const t = tabs.find(t => t.id === activeTabId);
  if (t && t.view.webContents.navigationHistory.canGoForward()) t.view.webContents.navigationHistory.goForward();
});
ipcMain.handle('browser:reload', () => {
  const t = tabs.find(t => t.id === activeTabId);
  if (t) t.view.webContents.isLoading() ? t.view.webContents.stop() : t.view.webContents.reload();
});
ipcMain.handle('browser:home', () => {
  const t = tabs.find(t => t.id === activeTabId);
  if (t) t.view.webContents.loadURL('https://duckduckgo.com/').catch(() => {});
});
ipcMain.handle('browser:clear-session', async () => {
  await browserSession.clearStorageData();
  await browserSession.clearCache();
  sendState();
  return true;
});
ipcMain.handle('browser:open-external', (_e, url) => {
  if (typeof url === 'string' && /^https?:\/\//i.test(url)) shell.openExternal(url);
});
app.on('before-quit', () => { quitting = true; });
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
