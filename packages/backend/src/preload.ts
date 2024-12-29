// @ts-ignore
window.IS_PRELOAD = true;

import {BaseSettings} from "@qommand/common/src/settings.types";

const {contextBridge, ipcRenderer} = require('electron/renderer'); // Needs to be require for some reason?

import {
    emitEvent,
    subscribe,
    addEmitEventHandler,
    emitEventWithDefaultHandler
} from "@qommand/common/src/eventSubscriptions";
import {getEventByName} from "@qommand/common/src/events/eventsByName";
import {onSettingsUpdated} from "@qommand/common/src/events/settingUpdated.event";
import {EventName} from "@qommand/common/src/events.types";
import {SettingsName} from "./settings/createSettings";
import type {Dialog} from 'electron';
import {nanoid} from "nanoid";

/**
 * This file is generically shared with all windows for now.
 */

addEmitEventHandler((event, ...args) => {
    ipcRenderer.send('event-subscription-to-main', event.name, ...args);
})

ipcRenderer.on('event-subscription-to-renderer', (_, eventName: EventName, ...args: any[]) => {
    const event = getEventByName(eventName);

    emitEventWithDefaultHandler(event, ...args);
})

contextBridge.exposeInMainWorld('windowApi', {
    close: () => ipcRenderer.send('close'),
    minimize: () => ipcRenderer.send('minimize'),
})

contextBridge.exposeInMainWorld('loggingApi', {
    send: (...args: any[]) => ipcRenderer.send('logging-to-main', ...args),
})

contextBridge.exposeInMainWorld('eventSubscriptionApi', {
    emitEvent,
    subscribe,
})

contextBridge.exposeInMainWorld('settingsApi', {
    requestSettings: (settingsName: SettingsName) => ipcRenderer.send('request-settings', settingsName),
    onRequestReceived: <T extends BaseSettings>(wantedSettingsName: SettingsName, callback: (settings: T) => void) => ipcRenderer.on('request-settings-response', (_, settingsName: SettingsName, settings: T) => {
        if (wantedSettingsName === settingsName) {
            callback(settings);
        }
    }),
    onSettingsUpdated: <T extends BaseSettings>(wantedSettingsName: SettingsName, callback: (updatedSetting: T) => void) => {
        onSettingsUpdated<T>((settingsName, updatedSetting) => {
            if (wantedSettingsName === settingsName) {
                callback(updatedSetting);
            }
        });
    },
    updateSettings: <T extends BaseSettings>(updatedSettings: T) => ipcRenderer.send('submit-setting-update', updatedSettings),
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

