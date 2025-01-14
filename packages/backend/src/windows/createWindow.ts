import {BrowserWindow} from "electron";
import path from "path";
import {isDev} from "../utils/isDev";
import {startupArguments} from "../utils/startupArguments";
import {eventBus} from "../utils/eventBus";
import {eventHandler} from "../utils/eventHandler";
import {closeWindowEventName, type CloseWindowEventData} from '@qommand/common/src/events/closeWindow.event';
import {minimizeWindowEventName, type MinimizeWindowEventData} from '@qommand/common/src/events/minimizeWindow.event';
import {StopListening} from "@qommand/common/src/eventbus.types";

type UrlParams = Record<string, string>;

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
    destroy: () => Promise<void>;
    getUniqueWindowId: () => number;
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
    let stopListening: StopListening;

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
        const finalUrlParams = {
            ...urlParams,
            __id: String(window.id)
        }

        const queryParams = new URLSearchParams(finalUrlParams).toString();

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

    const initializeEventBus = () => {
        isInitialized();

        stopListening = eventBus.listen((data) => window.webContents.send('eventbus-from-main', data));

        window.webContents.on('ipc-message', async (_, action, data) => {
            if (action === 'eventbus-to-main') {
                eventBus.emit(data);
            }
        });
    }

    const initializeWindowEventListeners = () => {
        const isCurrentWindow = ({windowId}: { windowId: number }) => windowId === window.id;

        eventHandler.listen<CloseWindowEventData>(closeWindowEventName, (data) => {
            if (isCurrentWindow(data)) {
                close();
            }
        });

        eventHandler.listen<MinimizeWindowEventData>(minimizeWindowEventName, (data) => {
            if (isCurrentWindow(data)) {
                minimize();
            }
        });
    }

    const destroy = async () => {
        isInitialized();

        await close();

        stopListening();

        window.destroy();
    }

    const initialize = async () => {
        console.log(`Initializing ${title} window`);

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

        initializeEventBus();
        initializeWindowEventListeners();
        // initializeEventListeners();
    }

    const getUniqueWindowId = () => {
        isInitialized();

        return window.id
    }

    return {
        initialize,
        open,
        close,
        minimize,
        openDevTools,
        closeDevTools,
        getWindow,
        destroy,
        getUniqueWindowId
    }
}