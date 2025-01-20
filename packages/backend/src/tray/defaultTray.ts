import {app, Menu, nativeImage, Tray} from "electron";
import {receiveWindow} from "../windows/receive.window";
import {sendWindow} from "../windows/send.window";
import {taskWindow} from "../windows/task.window";
import {isDev} from "../utils/isDev";
import MenuItemConstructorOptions = Electron.MenuItemConstructorOptions;
import {resetAllSettings} from "../utils/resetAllSettings";
import {commandsWindow} from "../windows/commands.window";
import {defaultLogo} from '@qommand/common/src/logos'

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
                label: 'Open Qommand Tasks',
                type: 'normal',
                click: () => taskWindow.open()
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