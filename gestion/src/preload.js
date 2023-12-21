// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  setclient: (client) => ipcRenderer.send('set-client', client),
  getclient: (channel,func) => ipcRenderer.on("get-client",(event,...args)=>{
    func(...args);
  }),
})