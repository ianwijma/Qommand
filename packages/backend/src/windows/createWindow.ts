import {app, BrowserWindow, screen} from "electron";
import path from "path";
import {isDev} from "../utils/isDev";
import {startupArguments} from "../utils/startupArguments";
import {eventBus} from "../utils/eventBus";
import {eventHandler} from "../utils/eventHandler";
import {closeWindowEventName, type CloseWindowEventData} from '@qommand/common/src/events/closeWindow.event';
import {minimizeWindowEventName, type MinimizeWindowEventData} from '@qommand/common/src/events/minimizeWindow.event';
import {StopListening} from "@qommand/common/src/eventbus.types";
import {sleep} from "../utils/sleep";

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
    openOnCursorScreen?: boolean,
    alwaysOnTop?: boolean,
    posX?: number,
    posY?: number,
    movable?: boolean,
}

type OpenParams = { urlParams?: UrlParams }

export type CreateWindowReturn = {
    initialize: () => Promise<void>;
    open: (params?: OpenParams) => Promise<void>;
    toggle: (params?: OpenParams) => Promise<void>;
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
                                 resizable = true,
                                 openOnCursorScreen = true,
                                 alwaysOnTop = false,
                                 posX = undefined,
                                 posY = undefined,
                                 movable = true,
                             }: CreateWindowParams): CreateWindowReturn => {
    let window: BrowserWindow;
    let loadWindowPromise: Promise<void>;
    let stopListening: StopListening;

    const isInitialized = () => {
        if (!window) throw new Error("Window was not initialized");
        if (window.isDestroyed()) throw new Error("Window was destroyed");
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
            activate: true,
        });

        // Give the devtools some time to open...
        await sleep(500);
    }
    const closeDevTools = async () => {
        isInitialized();

        window.webContents.closeDevTools();
    }
    const close = async () => {
        isInitialized();

        window.hide();

        if (isDev() || startupArguments.dev) closeDevTools();

        // Reset the window content.
        loadWindowPromise = loadWindow({urlParams: defaultUrlParams});
    }
    const minimize = async () => {
        isInitialized();

        window.minimize();
    }
    const getHash = ({urlParams}: { urlParams: UrlParams }): Record<string, string> => {
        isInitialized();

        return {
            ...urlParams,
            __id: String(window.id)
        }
    }
    const getUrl = (): string => {
        isInitialized();

        if (isDev()) {
            return `http://localhost:3000/${route}`
        }

        return path.join(__dirname, `../renderer/the_window/${route}.html`);
    }
    const loadWindow = async ({urlParams}: { urlParams: UrlParams }) => {
        isInitialized();

        const url = getUrl();
        const hash = getHash({urlParams});
        const search = new URLSearchParams(hash).toString();

        if (isDev()) {
            await window.loadURL(`${url}?${search}`);
        } else {
            await window.loadFile(url, {search});
        }
    }

    const moveWindowToCursorScreen = () => {
        isInitialized();

        // Get mouse cursor absolute position
        const {x: cursorX, y: cursorY} = screen.getCursorScreenPoint();

        // Find the display where the mouse cursor will be
        const currentDisplay = screen.getDisplayNearestPoint({x: cursorX, y: cursorY});

        const {width: windowWidth, height: windowHeight} = window.getBounds();

        // Center window relatively to that display
        const {x: screenX, y: screenY, width: screenWidth, height: screenHeight} = currentDisplay.workArea;
        const centerX = screenX + (screenWidth / 2) - (windowWidth / 2);
        const centerY = screenY + (screenHeight / 2) - (windowHeight / 2);

        const targetX = posX ? screenX + posX : centerX;
        const targetY = posY ? screenY + posY : centerY;
        console.log('Screen Pos', {
            title,
            windowWidth,
            windowHeight,
            screenX,
            screenY,
            screenWidth,
            screenHeight,
            centerX,
            centerY,
            targetX,
            targetY
        });
        window.setPosition(targetX, targetY);

        // Display the window
        window.show();
    }

    const open = async ({urlParams}: OpenParams = {}) => {
        isInitialized();

        const url = getUrl();
        const hash = getHash({urlParams});
        const search = new URLSearchParams(hash).toString();
        const wantedUrl = `${url}?${search}`;

        const currentUrl = window.webContents.getURL();
        if (currentUrl !== wantedUrl) {
            // Close window before loading new content.
            await close();

            loadWindowPromise = loadWindow({urlParams: urlParams});
        }

        if (window.isVisible()) {
            window.show();

            if (openOnCursorScreen) {
                moveWindowToCursorScreen();
            }
        } else {
            await loadWindowPromise;

            window.show();

            if (openOnCursorScreen) {
                moveWindowToCursorScreen();
            }
        }

        // Always trigger, ensure the dev tools are open
        if (isDev() || startupArguments.dev) {
            await openDevTools();

            // Move the window in front of the devtools
            window.focus();
        }
    }

    const toggle = async ({urlParams}: OpenParams = {}) => {
        if (window.isVisible()) {
            await close();
        } else {
            await open({urlParams});
        }
    }

    const initializeWindowEvents = () => {
        isInitialized();

        window.on('close', (event) => {
            // @ts-expect-error - isQuiting is not officially defined.
            if (!app.isQuiting) {
                event.preventDefault();
                close();
            }

            return false;
        })
    }

    const initializeEventBus = () => {
        isInitialized();

        // Stop previous listener.
        if (!!stopListening) {
            stopListening();
        }

        stopListening = eventBus.listen((data) => window.webContents.send('eventbus-from-main', data));

        window.webContents.on('ipc-message', async (_, action, data) => {
            if (action === 'eventbus-to-main') {
                eventBus.emit(data);
            }
        });
    }

    const initializeWindowActions = () => {
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

        // Stop existing listeners.
        if (!!stopListening) {
            stopListening();

            stopListening = null;
        }

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
            alwaysOnTop,
            title,
            x: posX,
            y: posY,
            movable,
            webPreferences: {
                preload: path.join(__dirname, 'preload.js'),
            },
        })

        loadWindowPromise = loadWindow({urlParams: defaultUrlParams});

        initializeWindowEvents();
        initializeEventBus();
        initializeWindowActions();
    }

    const getUniqueWindowId = () => {
        isInitialized();

        return window.id
    }

    return {
        initialize,
        open,
        toggle,
        close,
        minimize,
        openDevTools,
        closeDevTools,
        getWindow,
        destroy,
        getUniqueWindowId
    }
}