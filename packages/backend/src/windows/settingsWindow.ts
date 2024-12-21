import {WindowType} from "./window.type";
import path from "path";
import {BrowserWindow} from "electron";
import {isDev} from "../utils/isDev";
import {ButtonClickedEvent} from "../eventSubscriptions/events/buttonClicked.event";
import {emitEvent} from "../eventSubscriptions/subscriptionHandler";

let window: BrowserWindow;
export const settingsWindow: WindowType & { loadWindow: () => Promise<void> } = {
    async initialize() {
        console.log('Initializing settings window');
        window = new BrowserWindow({
            show: false,
            width: 1080,
            height: 700,
            minWidth: 1080,
            minHeight: 700,
            frame: false,
            autoHideMenuBar: true,
            title: 'Qommand Settings',
            webPreferences: {
                preload: path.join(__dirname, 'preload.js'),
            },
        });

        window.webContents.on('ipc-message', (_, action) => {
            switch (action) {
                case 'close':
                    this.close();
                    break;
                case 'minimize':
                    this.minimize();
                    break;
                case 'click':
                    emitEvent(ButtonClickedEvent)
                    break;
            }
        });
    },
    async loadWindow() {
        if (isDev()) {
            await window.loadURL('http://localhost:3000/settings');
        } else {
            // TODO: Make work
            await window.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/settings.html`));
        }
    },
    async open() {
        if (window.isVisible()) {
            window.show()
        } else {
            await this.loadWindow();

            console.log('Opening main window');
            window.show();

            if (isDev()) this.openDevTools();
        }
    },
    async close() {
        console.log('Closing Settings window');
        window.hide();

        if (isDev()) this.closeDevTools();
    },
    async minimize() {
        console.log('Minimizing Settings window');
        window.minimize();
    },
    async openDevTools() {
        console.log('Opening dev tools');
        window.webContents.openDevTools({
            mode: 'detach',
            title: 'Settings Dev Tools',
            activate: true
        });
    },
    async closeDevTools() {
        console.log('closing dev tools');
        window.webContents.closeDevTools();
    }
};