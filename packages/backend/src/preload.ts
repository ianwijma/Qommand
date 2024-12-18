// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

const {contextBridge, ipcRenderer} = require('electron/renderer')

console.log('preload.ts loaded')

contextBridge.exposeInMainWorld('windowApi', {
    close: () => ipcRenderer.send('close'),
    minimize: () => ipcRenderer.send('minimize'),
})
