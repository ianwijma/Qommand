import {BrowserWindow} from "electron";
import path from "path";
import {addEmitEventHandler, emitEventWithDefaultHandler} from '@qommand/common/src/eventSubscriptions'
import {getEventByName} from "@qommand/common/src/events/eventsByName";
import {isDev} from "../utils/isDev";
import {startupArguments} from "../utils/startupArguments";
import {getSettingByName} from "../settings/settingsByName";
import {simpleInputDialog} from "./dialog.window";
import {logger} from "../utils/logger";

type UrlParams = { [key: string]: string };

export type CreateWindowParams = {
    title: string,
    route: string,
    defaultUrlParams?: UrlParams,
    width?: number,
    height?: number,
    minWidth?: number,
    minHeight?: number,
    resizable?: boolean,
}

type OpenParams = { urlParams?: UrlParams }

export type CreateWindowReturn = {
    initialize: () => Promise<void>;
    open: (params?: OpenParams) => Promise<void>;
    close: () => Promise<void>;
    minimize: () => Promise<void>;
    openDevTools: () => Promise<void>;
    closeDevTools: () => Promise<void>;
    getWindow: () => BrowserWindow;
};

export const createWindow = ({
                                 title,
                                 route,
                                 defaultUrlParams,
                                 width = 1080,
                                 height = 700,
                                 minWidth = 1080,
                                 minHeight = 700,
                                 resizable = true
                             }: CreateWindowParams): CreateWindowReturn => {
    let window: BrowserWindow;
    let loadWindowPromise: Promise<void>;

    const isInitialized = () => {
        if (!window) throw new Error("Window was not initialized");
    }

    const getWindow = () => {
        isInitialized();

        return window;
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
        loadWindowPromise = loadWindow({urlParams: defaultUrlParams});
    }
    const minimize = async () => {
        isInitialized();

        window.minimize();
    }
    const getUrl = ({urlParams}: { urlParams: UrlParams }): string => {
        const queryParams = new URLSearchParams(urlParams).toString();

        if (isDev()) {
            return `http://localhost:3000/${route}?${queryParams}`
        }

        return path.join(__dirname, `../renderer/the_window/${route}.html?${queryParams}`);
    }
    const loadWindow = async ({urlParams}: { urlParams: UrlParams }) => {
        isInitialized();

        const url = getUrl({urlParams});

        if (isDev()) {
            await window.loadURL(url);
        } else {
            await window.loadFile(url);
        }
    }
    const open = async ({urlParams}: OpenParams = {}) => {
        isInitialized();

        const wantedUrl = getUrl({urlParams: urlParams});
        const currentUrl = window.webContents.getURL();
        if (currentUrl !== wantedUrl) {
            // Close window before loading new content.
            await close();

            loadWindowPromise = loadWindow({urlParams: urlParams});
        }

        if (window.isVisible()) {
            window.show();
        } else {
            await loadWindowPromise;

            window.show();
        }

        // Always trigger, ensure the dev tools are open
        if (isDev() || 'dev' in startupArguments) await openDevTools();
    }

    const initializeEventListeners = () => {
        isInitialized();

        window.webContents.on('ipc-message', async (_, action, ...params) => {
            logger.verbose('ipc-message', action, params)
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
                    logger.verbose('event-subscription-to-main', params);
                    const [eventName, args] = params;
                    const event = getEventByName(eventName);
                    emitEventWithDefaultHandler(event, ...args);
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
                    // TODO: Update
                    const [id, dialogFunction, ...dialogOptions] = params;
                    const results = await simpleInputDialog.open({
                        title: 'Wow, such title',
                        message: 'Amazing message!~',
                        inputPlaceholder: 'Amazing message...',
                    });

                    window.webContents.send('open-dialog-response', id, results);


                    // if (dialogFunction in dialog) {
                    //     // @ts-ignore checking functions
                    //     const results = await dialog[dialogFunction](...dialogOptions);
                    // } else {
                    //     throw new Error(`Unknown dialog function ${dialogFunction}`);
                    // }
                }
                    break;
            }
        });

        addEmitEventHandler((event, ...args) => {
            logger.verbose('event-subscription-to-renderer', event, ...args);
            window.webContents.send('event-subscription-to-renderer', event.name, ...args);
        });
    }

    const initialize = async () => {
        logger.verbose(`Initializing ${title} window`);

        window = new BrowserWindow({
            show: false,
            width: width < minWidth ? minWidth : width,
            height: height < minHeight ? minHeight : height,
            minWidth: minWidth,
            minHeight: minHeight,
            resizable: resizable,
            frame: false,
            autoHideMenuBar: true,
            title,
            webPreferences: {
                preload: path.join(__dirname, 'preload.js'),
            },
        })

        loadWindowPromise = loadWindow({urlParams: defaultUrlParams});

        initializeEventListeners();
    }

    return {
        initialize,
        open,
        close,
        minimize,
        openDevTools,
        closeDevTools,
        getWindow,
    }
}