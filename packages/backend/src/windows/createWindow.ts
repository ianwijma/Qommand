import {WindowType} from "./window.type";
import {BrowserWindow} from "electron";
import path from "path";
import {addEmitEventHandler, emitEvent, getEventByName} from '@qommand/common/src/eventSubscriptions'
import {isDev} from "../utils/isDev";

export type CreateWindowParams = {
    title: string,
    route: string,
}

export type CreateWindowReturn = WindowType & {
    genericInitializeWindow: () => Promise<void>;
};

export const createWindow = ({title, route}: CreateWindowParams): CreateWindowReturn => {
    let window: BrowserWindow;

    const openDevTools = async () => {
        window.webContents.openDevTools({
            mode: 'detach',
            title: `${title} Dev Tools`,
            activate: true
        });
    }
    const closeDevTools = async () => {
        window.webContents.closeDevTools();
    }
    const close = async () => {
        window.hide();

        if (isDev()) closeDevTools();
    }
    const minimize = async () => {
        window.minimize();
    }
    const loadWindow = async () => {
        if (isDev()) {
            await window.loadURL(`http://localhost:3000/${route}`);
        } else {
            // TODO: Make work
            await window.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/${route}.html`));
        }
    }
    const open = async () => {
        if (window.isVisible()) {
            window.show()
        } else {
            await loadWindow();

            window.show();

            if (isDev()) openDevTools();
        }
    }

    const genericInitializeWindow = async () => {
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
            }
        });

        addEmitEventHandler((event) => {
            window.webContents.send('event-subscription-to-renderer', event.name);
        })
    }

    const initialize = async () => {
        genericInitializeWindow();
    }

    return {
        genericInitializeWindow,
        initialize,
        open,
        close,
        minimize,
        openDevTools,
        closeDevTools,
    }
}