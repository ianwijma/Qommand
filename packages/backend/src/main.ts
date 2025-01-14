import {app} from 'electron';
import started from 'electron-squirrel-startup';
import {mainWindow} from "./windows/main.window";
import {settingsWindow} from "./windows/settings.window";
import {defaultTray} from "./tray/defaultTray";
import {taskWindow} from "./windows/task.window";
import {taskFolderSettings, tasksSettings} from "./settings";
import {startupArguments} from "./utils/startupArguments";
import {isDev} from "./utils/isDev";
import './windows/dialog.window';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
    app.quit();
}

let isSingleInstance = app.requestSingleInstanceLock()
if (!isSingleInstance) {
    app.quit();
} else {
    const onReady = async () => {
        await taskFolderSettings.initialize();
        await tasksSettings.initialize();
        await taskWindow.initialize();
        await mainWindow.initialize();
        await settingsWindow.initialize();
        await defaultTray.initialize();

        if (isDev() || startupArguments.reset) {
            await tasksSettings.resetSettings();
        }
    }

    app.on('ready', onReady);
}
