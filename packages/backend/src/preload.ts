// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import type {IpcRendererEvent} from 'electron';

/**
 * This file is generically shared with all windows for now.
 * It needs to be refactored, but it's OK for now...
 */

const {contextBridge, ipcRenderer} = require('electron/renderer')

console.log('preload.ts loaded')

contextBridge.exposeInMainWorld('windowApi', {
    close: () => ipcRenderer.send('close'),
    minimize: () => ipcRenderer.send('minimize'),
    click: () => ipcRenderer.send('click'),
    onClick: (callback: () => void) => ipcRenderer.on('clicked', () => callback()),
})
