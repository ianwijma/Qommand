import {WindowControls} from "./window.types";
import path from "path";
import {BrowserWindow} from "electron";
import {isDev} from "../utils/isDev";

let window: BrowserWindow;
export const mainWindow: WindowControls = {
    async initialize() {
        console.log('Initializing main window');
        window = new BrowserWindow({
            show: false,
            width: 1280,
            height: 800,
            minHeight: 800,
            minWidth: 1280,
            frame: false,
            autoHideMenuBar: true,
            title: 'Qommand',
            webPreferences: {
                preload: path.join(__dirname, '..', 'preload.js'),
            },
        });

        // and load the index.html of the app.
        if (isDev()) {
            await window.loadURL('http://localhost:3000');
        } else {
            // TODO: Update
            await window.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
        }
    },
    async open() {
        console.log('Opening main window');
        window.show();

        if (isDev()) this.openDevTools();
    },
    async close() {
        console.log('Closing main window');
        window.hide();
    },
    async fullscreen() {
        console.log('Fullscreen main window');
        window.isFullScreen() ? window.setFullScreen(false) : window.setFullScreen(true);
    },
    async maximize() {
        console.log('Maximizing main window');
        window.maximize();
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
    }
};