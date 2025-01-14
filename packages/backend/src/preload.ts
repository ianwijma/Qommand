import IpcRendererEvent = Electron.IpcRendererEvent;

// Needs to be required for some reason?
const {contextBridge, ipcRenderer} = require('electron/renderer');

import {SimpleEventBusData, SimpleEventBus} from "@qommand/common/src/eventbus.types";

/**
 * This file provides generic functionality to all the windows.
 */

contextBridge.exposeInMainWorld('eventBusApi', {
    emit: <T extends SimpleEventBusData>(data: T) => {
        console.log('eventBusApi - emit', data);

        ipcRenderer.send('eventbus-to-main', data)
    },
    listen: <T extends SimpleEventBusData>(callback: (data: T) => void) => {
        console.log('eventBusApi - listen', callback);

        const handle = (_: IpcRendererEvent, data: T) => {
            console.log('eventBusApi - listen - handle', data);

            callback(data)
        };

        ipcRenderer.on('eventbus-from-main', handle);

        return () => ipcRenderer.off('eventbus', handle);
    },
    listenOnce: <T extends SimpleEventBusData>(callback: (data: T) => void) => {
        console.log('eventBusApi - listenOnce', callback);

        const handle = (_: IpcRendererEvent, data: T) => {
            console.log('eventBusApi - listenOnce - handle', data);

            callback(data)
        };

        ipcRenderer.once('eventbus-from-main', handle);
    },
} as SimpleEventBus)

