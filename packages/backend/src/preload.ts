// @ts-ignore
import IpcRendererEvent = Electron.IpcRendererEvent;

const {contextBridge, ipcRenderer} = require('electron/renderer'); // Needs to be require for some reason?

import {
    emitEvent,
    subscribe,
    addEmitEventHandler,
} from "@qommand/common/src/eventSubscriptions";
import {getEventByName} from "@qommand/common/src/events/eventsByName";
import {EventName} from "@qommand/common/src/events.types";
import type {Dialog} from 'electron';
import {nanoid} from "nanoid";
import {SimpleEventBusData, SimpleEventBus} from "@qommand/common/src/eventbus.types";

/**
 * This file is generically shared with all windows for now.
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

addEmitEventHandler((event, ...args) => {
    console.log('event-subscription-to-main', event, ...args);

    ipcRenderer.send('event-subscription-to-main', event.name, ...args);
})

ipcRenderer.on('event-subscription-to-renderer', (_, eventName: EventName, ...args: any[]) => {
    const event = getEventByName(eventName);

    console.log('event-subscription-to-renderer', event, ...args);

    emitEvent(event, ...args);
})

contextBridge.exposeInMainWorld('eventSubscriptionApi', {
    emitEvent: (event, ...args) => {
        console.log('eventSubscriptionApi - emitEvent', event, ...args);
        emitEvent(event, ...args);
    },
    subscribe: (event, subscriptions) => {
        console.log('eventSubscriptionApi - subscribe', event, subscriptions);
        subscribe(event, subscriptions);
    },
} as {
    emitEvent: typeof emitEvent;
    subscribe: typeof subscribe;
})

type ArgumentTypes<F extends Function> = F extends (...args: infer A) => any ? A : never;

contextBridge.exposeInMainWorld('dialogApi', {
    open: async <T extends keyof Dialog>(dialogName: T, ...dialogOptions: ArgumentTypes<Dialog[T]>) => {
        return new Promise((resolve) => {
            const id = nanoid();

            ipcRenderer.on('open-dialog-response', (_, responseId, results) => {
                if (responseId === id) {
                    resolve(results);
                }
            })

            ipcRenderer.send('open-dialog', id, dialogName, ...dialogOptions);
        })
    },

})

