import { app, shell, BrowserWindow,screen } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import dataBase from './server/database/index'
import { handleClientIPC } from './server/ipcHandlers/ClientIPC'
import { handleArticleIPC} from './server/ipcHandlers/ArticleIPC'
import { handleFactureIPC } from './server/ipcHandlers/FactureIPC'
import { handleFournisseurIPC } from './server/ipcHandlers/FournisseurIPC'
import { listOfClient } from './server/ipcHandlers/listOfClient'
import { listOfFourn } from './server/ipcHandlers/listOfFourn'
let mainWindow
function createWindow() {
  // Create the browser window.
  const mainScreen = screen.getPrimaryDisplay();
  const dimensions = mainScreen.size;
   mainWindow = new BrowserWindow({
    width: dimensions.width,
    height: dimensions.height,
    show: false,
    // autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })
  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })
  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  // All listener
  handleClientIPC(mainWindow);
  handleArticleIPC(mainWindow);
  handleFactureIPC(mainWindow);
  handleFournisseurIPC(mainWindow);
  listOfClient(mainWindow,createNewOnglet)
  listOfFourn(mainWindow,createNewOnglet)
  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})



function createNewOnglet(appToRender,width,height) {
  // Create the browser window.
let newWindow = new BrowserWindow({
    width: width,
    height: height,
    show: false,
    // autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })
  newWindow.on('ready-to-show', () => {
    newWindow.show()
  })
  newWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })
  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (!app.isPackaged && process.env['ELECTRON_RENDERER_URL']) {
    newWindow.loadURL(process.env['ELECTRON_RENDERER_URL']+'/'+appToRender)
      } else {
        newWindow.loadFile(path.join(__dirname, '../renderer/'+appToRender))
      }
      return newWindow
}
