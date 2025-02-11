import {app, Menu, nativeImage, Tray} from "electron";
import {receiveWindow} from "../windows/receive.window";
import {sendWindow} from "../windows/send.window";
import {isDev} from "../utils/isDev";
import MenuItemConstructorOptions = Electron.MenuItemConstructorOptions;
import {resetAllSettings} from "../utils/resetAllSettings";
import {commandsWindow} from "../windows/commands.window";
import {defaultLogo} from '@qommand/common/src/logos'
import {aboutWindow} from "../windows/about.window";
import {runnerWindow} from "../windows/runner.window";
import {clipboardHistoryWindow} from "../windows/clipboard-history.window";

export const defaultTray = {
    async initialize() {
        console.info('Initializing default tray');
        const icon = nativeImage.createFromDataURL(defaultLogo)
        const tray = new Tray(icon);
        tray.setToolTip('Qommand');

        let devItems: MenuItemConstructorOptions[] = [
            {
                type: 'separator',
            },
            {
                label: 'Reset Settings',
                type: 'normal',
                click: () => resetAllSettings()
            },
            {
                label: 'Sending',
                type: 'normal',
                click: () => sendWindow.open()
            },
            {
                label: 'Received',
                type: 'normal',
                click: () => receiveWindow.open()
            },
        ]

        const contextMenu = Menu.buildFromTemplate([
            {
                label: 'Qommands',
                type: 'normal',
                click: () => commandsWindow.open()
            },
            {
                label: 'Toggle Runner',
                type: 'normal',
                click: () => runnerWindow.toggle()
            },
            {
                label: 'Toggle clipboard history',
                type: 'normal',
                click: () => clipboardHistoryWindow.toggle()
            },
            {
                label: 'About',
                type: 'normal',
                click: () => aboutWindow.open()
            },
            ...isDev() ? devItems : [],
            {
                type: 'separator',
            },
            {
                label: 'Quit Qommand',
                type: 'normal',
                click: () => app.quit()
            },
        ]);
        tray.setContextMenu(contextMenu);
    }
};