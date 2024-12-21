import {app} from 'electron';
import started from 'electron-squirrel-startup';
import {mainWindow} from "./windows/mainWindow";
import {settingsWindow} from "./windows/settingsWindow";
import {defaultTray} from "./tray/defaultTray";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
    app.quit();
}

const onReady = async () => {
    await mainWindow.initialize();
    await settingsWindow.initialize();
    await defaultTray.initialize();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', onReady);

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
