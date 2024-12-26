import {BrowserWindow, dialog} from "electron";
import path from "path";
import {addEmitEventHandler, emitEvent} from '@qommand/common/src/eventSubscriptions'
import {getEventByName} from "@qommand/common/src/events/eventsByName";
import {isDev} from "../utils/isDev";
import {startupArguments} from "../utils/startupArguments";
import {getSettingByName} from "../settings/settingsByName";

export type CreateWindowParams = {
    title: string,
    route: string,
}

export type CreateWindowReturn = {
    initialize: () => Promise<void>;
    open: () => Promise<void>;
    close: () => Promise<void>;
    minimize: () => Promise<void>;
    openDevTools: () => Promise<void>;
    closeDevTools: () => Promise<void>;
};

export const createWindow = ({title, route}: CreateWindowParams): CreateWindowReturn => {
    let window: BrowserWindow;
    let loadWindowPromise: Promise<void>;

    const isInitialized = () => {
        if (!window) throw new Error("Window was not initialized");
    }

    const openDevTools = async () => {
        isInitialized();

        window.webContents.openDevTools({
            mode: 'detach',
            title: `${title} Dev Tools`,
            activate: true
        });
    }
    const closeDevTools = async () => {
        isInitialized();

        window.webContents.closeDevTools();
    }
    const close = async () => {
        isInitialized();

        window.hide();

        if (isDev() || 'dev' in startupArguments) closeDevTools();

        // Reset the window content.
        loadWindowPromise = loadWindow();
    }
    const minimize = async () => {
        isInitialized();

        window.minimize();
    }
    const loadWindow = async () => {
        isInitialized();

        if (isDev()) {
            await window.loadURL(`http://localhost:3000/${route}`);
        } else {
            // TODO: Make work
            await window.loadFile(path.join(__dirname, `../renderer/the_window/${route}.html`));
        }
    }
    const open = async () => {
        isInitialized();

        if (window.isVisible()) {
            window.show();
        } else {
            await loadWindowPromise;

            window.show();
        }

        // Always trigger, ensure the dev tools are open
        if (isDev() || 'dev' in startupArguments) openDevTools();
    }

    const initializeEventListeners = () => {
        isInitialized();

        window.webContents.on('ipc-message', async (_, action, ...params) => {
            switch (action) {
                case 'close': {
                    close();
                }
                    break;
                case 'minimize': {
                    minimize();
                }
                    break;
                case 'event-subscription-to-main': {
                    const [eventName, eventData] = params;
                    const event = getEventByName(eventName);
                    emitEvent(event, eventData);
                }
                    break;
                case 'submit-setting-update': {
                    const [settingToUpdate] = params;
                    const {name} = settingToUpdate;
                    const settings = getSettingByName(name);
                    await settings.updateSettings(settingToUpdate);
                }
                    break;
                case 'request-settings': {
                    const [settingName] = params;
                    const settings = getSettingByName(settingName);
                    window.webContents.send('request-settings-response', settings.name, settings.getSettings());
                }
                    break;
                case 'open-dialog': {
                    const [id, dialogFunction, ...dialogOptions] = params;
                    if (dialogFunction in dialog) {
                        // @ts-ignore checking functions
                        const results = await dialog[dialogFunction](...dialogOptions);
                        window.webContents.send('open-dialog-response', id, results);
                    } else {
                        throw new Error(`Unknown dialog function ${dialogFunction}`);
                    }
                }
                    break;
            }
        });

        addEmitEventHandler((event, ...args) => {
            window.webContents.send('event-subscription-to-renderer', event.name, ...args);
        });
    }

    const initialize = async () => {
        console.log(`Initializing ${title} window`);

        window = new BrowserWindow({
            show: false,
            width: 1080,
            height: 700,
            minWidth: 1080,
            minHeight: 700,
            frame: false,
            autoHideMenuBar: true,
            title,
            webPreferences: {
                preload: path.join(__dirname, 'preload.js'),
            },
        })

        loadWindowPromise = loadWindow();

        initializeEventListeners();
    }

    return {
        initialize,
        open,
        close,
        minimize,
        openDevTools,
        closeDevTools,
    }
}