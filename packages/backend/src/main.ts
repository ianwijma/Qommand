import {app} from 'electron';
import started from 'electron-squirrel-startup';
import {mainWindow} from "./windows/mainWindow";
import {settingsWindow} from "./windows/settingsWindow";
import {defaultTray} from "./tray/defaultTray";
import {taskWindow} from "./windows/taskWindow";
import {tasksSettings} from "./settings";
import {startupArguments} from "./utils/startupArguments";
import {isDev} from "./utils/isDev";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
    app.quit();
}

let isSingleInstance = app.requestSingleInstanceLock()
if (!isSingleInstance) {
    app.quit()
}

const onReady = async () => {
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
