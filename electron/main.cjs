const { app, BrowserWindow, ipcMain, shell, dialog } = require('electron')
const path = require('path')
const { autoUpdater } = require('electron-updater')

const devUrl = process.env.MOMENTUM_DEV_URL
let win = null

/**
 * Auto-update via electron-updater against GitHub Releases. On launch (and
 * every 6 hours) it checks for a newer published version, downloads it in the
 * background, and offers to restart-and-apply when ready.
 */
function initAutoUpdates() {
  if (!app.isPackaged) return // updater only works in a packaged build
  autoUpdater.autoDownload = true

  const check = () => autoUpdater.checkForUpdates().catch(() => {})
  check()
  setInterval(check, 6 * 60 * 60 * 1000)

  autoUpdater.on('update-downloaded', async (info) => {
    const { response } = await dialog.showMessageBox(win ?? undefined, {
      type: 'info',
      buttons: ['Restart now', 'Later'],
      defaultId: 0,
      cancelId: 1,
      title: 'Update ready',
      message: `Momentum ${info.version} is ready to install.`,
      detail: 'Restart the app to finish updating. Your tasks are kept.',
    })
    if (response === 0) autoUpdater.quitAndInstall()
  })
}

function createWindow() {
  win = new BrowserWindow({
    width: 1240,
    height: 820,
    minWidth: 900,
    minHeight: 600,
    frame: false, // custom in-app title bar
    backgroundColor: '#0a0d14',
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  win.once('ready-to-show', () => win.show())

  if (devUrl) {
    win.loadURL(devUrl)
  } else {
    win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))
  }

  // Open any external links in the user's real browser, not inside the app.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http')) shell.openExternal(url)
    return { action: 'deny' }
  })

  win.on('closed', () => {
    win = null
  })
}

app.whenReady().then(() => {
  createWindow()
  initAutoUpdates()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

ipcMain.on('win:minimize', () => win && win.minimize())
ipcMain.on('win:toggle-maximize', () => {
  if (!win) return
  if (win.isMaximized()) win.unmaximize()
  else win.maximize()
})
ipcMain.on('win:close', () => win && win.close())
