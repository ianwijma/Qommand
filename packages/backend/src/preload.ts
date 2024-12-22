const {contextBridge, ipcRenderer} = require('electron/renderer'); // Needs to be require for some reason?

import {
    emitEvent,
    subscribe,
    addEmitEventHandler,
    emitEventWithDefaultHandler, getEventByName
} from "@qommand/common/src/eventSubscriptions";
import {EventName} from "@qommand/common/src/types";

/**
 * This file is generically shared with all windows for now.
 */


addEmitEventHandler((event) => {
    ipcRenderer.send('event-subscription-to-main', event.name)
})

ipcRenderer.on('event-subscription-to-renderer', (_, eventName: EventName) => {
    const event = getEventByName(eventName);

    emitEventWithDefaultHandler(event);
})

contextBridge.exposeInMainWorld('windowApi', {
    close: () => ipcRenderer.send('close'),
    minimize: () => ipcRenderer.send('minimize'),
})

contextBridge.exposeInMainWorld('eventSubscriptionApi', {
    emitEvent,
    subscribe,
})
