import {BaseSettings} from "@qommand/common/src/settings.types";

const {contextBridge, ipcRenderer} = require('electron/renderer'); // Needs to be require for some reason?

import {
    emitEvent,
    subscribe,
    addEmitEventHandler,
    emitEventWithDefaultHandler, getEventByName
} from "@qommand/common/src/eventSubscriptions";
import {onSettingsUpdated} from "@qommand/common/src/events/settingUpdated.event";
import {EventName} from "@qommand/common/src/events.types";
import {SettingsName} from "./settings/createSettings";

/**
 * This file is generically shared with all windows for now.
 */


addEmitEventHandler((event, eventData) => {
    ipcRenderer.send('event-subscription-to-main', event.name, eventData)
})

ipcRenderer.on('event-subscription-to-renderer', (_, eventName: EventName, ...args: any[]) => {
    const event = getEventByName(eventName);

    emitEventWithDefaultHandler(event, ...args);
})

contextBridge.exposeInMainWorld('windowApi', {
    close: () => ipcRenderer.send('close'),
    minimize: () => ipcRenderer.send('minimize'),
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


