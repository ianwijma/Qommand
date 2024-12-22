import {BrowserWindow} from "electron";
import path from "path";
import {addEmitEventHandler, emitEvent, getEventByName} from '@qommand/common/src/eventSubscriptions'
import {isDev} from "../utils/isDev";
import {startupArguments} from "../utils/startupArguments";
import * as settings from "../settings";
import {CreateSettingReturn} from "../settings/createSettings";
import {BaseSettings} from "@qommand/common/src/settings.types";

type SettingsByNameMap = { [name: string]: CreateSettingReturn<BaseSettings> }

const settingsByNameMap: SettingsByNameMap = Object.values(settings).reduce<SettingsByNameMap>((map, settings) => {
    map[settings.name] = settings;

    return map;
}, {})

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
            window.show()
        } else {
            await loadWindowPromise;

            window.show();

            if (isDev() || 'dev' in startupArguments) openDevTools();
        }
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

        window.webContents.on('ipc-message', (_, action, ...params) => {
            switch (action) {
                case 'close':
                    close();
                    break;
                case 'minimize':
                    minimize();
                    break;
                case 'event-subscription-to-main':
                    const [eventName] = params;
                    const event = getEventByName(eventName);
                    emitEvent(event);
                    break;
                case 'submit-setting-update':
                    const [updatedSettings] = params;
                    const {name} = updatedSettings;
                    const settings = settingsByNameMap[name];
                    settings.updateSettings(updatedSettings);
                    break;
            }
        });

        addEmitEventHandler((event) => {
            window.webContents.send('event-subscription-to-renderer', event.name);
        })
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