import {WindowType} from "./window.type";
import path from "path";
import {BrowserWindow} from "electron";
import {isDev} from "../utils/isDev";
import {subscribe} from "@qommand/common/src/eventSubscriptions";
import {ButtonClickedEvent} from "@qommand/common/src/events/buttonClicked.event";
import {createWindow} from "./createWindow";

export const mainWindow = createWindow({
    title: 'Qommand',
    route: 'qommand'
});


let window: BrowserWindow;
export const mainWindowOld: WindowType & { loadWindow: () => Promise<void> } = {
    async initialize() {
        console.log('Initializing main window');
        window = new BrowserWindow({
            show: false,
            width: 1080,
            height: 700,
            minWidth: 1080,
            minHeight: 700,
            frame: false,
            autoHideMenuBar: true,
            title: 'Qommand',
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
            }
        });

        subscribe(ButtonClickedEvent, {
            200: () => window.webContents.send('clicked'),
            100: () => console.log('last'),
            50: () => console.log('middle'),
            0: () => console.log('first')
        })
    },
    async loadWindow() {
        if (isDev()) {
            await window.loadURL('http://localhost:3000/qommand');
        } else {
            // TODO: Make work
            await window.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/qommand.html`));
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
        console.log('Closing main window');
        window.hide();

        if (isDev()) this.closeDevTools();
    },
    async minimize() {
        console.log('Minimizing main window');
        window.minimize();
    },
    async openDevTools() {
        console.log('Opening dev tools');
        window.webContents.openDevTools({
            mode: 'detach',
            title: 'Qommand Dev Tools',
            activate: true
        });
    },
    async closeDevTools() {
        console.log('closing dev tools');
        window.webContents.closeDevTools();
    }
};