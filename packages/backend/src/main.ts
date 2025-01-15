import {app} from 'electron';
import started from 'electron-squirrel-startup';
import {receiveWindow} from "./windows/receive.window";
import {sendWindow} from "./windows/send.window";
import {defaultTray} from "./tray/defaultTray";
import {taskWindow} from "./windows/task.window";
import {startupArguments} from "./utils/startupArguments";
import {isDev} from "./utils/isDev";
import './windows/dialog.window';
import {taskFolderSettings} from "./settings/folders.settings";
import {tasksSettings} from "./settings/tasks.setting";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
    app.quit();
}

let isSingleInstance = app.requestSingleInstanceLock()
if (!isSingleInstance) {
    app.quit();
} else {
    const onReady = async () => {
        // Settings
        await taskFolderSettings.initialize();
        await tasksSettings.initialize();

        // Windows
        await taskWindow.initialize();

        // Tray
        await defaultTray.initialize();

        if (isDev() || startupArguments.reset) {
            await receiveWindow.initialize();
            await sendWindow.initialize();

            await taskFolderSettings.resetSettings();
            await tasksSettings.resetSettings();
        }
    }

    app.on('ready', onReady);
}
