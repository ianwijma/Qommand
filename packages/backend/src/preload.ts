import IpcRendererEvent = Electron.IpcRendererEvent;

// Needs to be required for some reason?
const {contextBridge, ipcRenderer} = require('electron/renderer');

import {SimpleEventBusData, SimpleEventBus} from "@qommand/common/src/eventbus.types";

/**
 * This file provides generic functionality to all the windows.
 */

contextBridge.exposeInMainWorld('eventBusApi', {
    emit: <T extends SimpleEventBusData>(data: T) => {
        ipcRenderer.send('eventbus-to-main', data)
    },
    listen: <T extends SimpleEventBusData>(callback: (data: T) => void) => {
        const handle = (_: IpcRendererEvent, data: T) => {
            callback(data)
        };

        ipcRenderer.on('eventbus-from-main', handle);

        return () => ipcRenderer.off('eventbus-from-main', handle);
    },
    listenOnce: <T extends SimpleEventBusData>(callback: (data: T) => void) => {
        const handle = (_: IpcRendererEvent, data: T) => {
            callback(data)
        };

        ipcRenderer.once('eventbus-from-main', handle);
    },
} as SimpleEventBus)

