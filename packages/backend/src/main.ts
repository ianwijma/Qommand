import {app} from 'electron';
import started from 'electron-squirrel-startup';
import {receiveWindow} from "./windows/receive.window";
import {sendWindow} from "./windows/send.window";
import {defaultTray} from "./tray/defaultTray";
import {taskWindow} from "./windows/task.window";
import {startupArguments} from "./utils/startupArguments";
import {isDev} from "./utils/isDev";
import './windows/dialog.window';
import {commandsFolderSettings} from "./settings/folders.settings";
import './run-shell';
import {resetAllSettings} from "./utils/resetAllSettings";
import {commandsWindow} from "./windows/commands.window";
import {commandsSettings} from "./settings/commands.setting";
import {aboutWindow} from "./windows/about.window";
import {keyboardSettings} from "./settings/keyboard.setting";
import {runnerWindow} from "./windows/runner.window";
import {keyboardShortcuts} from "./utils/keyboard-shortcuts";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
    app.quit();
}

let isSingleInstance = app.requestSingleInstanceLock()
if (!isSingleInstance) {
    app.quit();
} else {
    const onBeforeQuit = () => {
        // @ts-expect-error - isQuiting is not officially defined.
        app.isQuiting = true;
    }

    app.on('before-quit', onBeforeQuit);

    const onReady = async () => {
        // Settings
        await keyboardSettings.initialize();
        await commandsFolderSettings.initialize();
        await commandsSettings.initialize();

        if (startupArguments.reset) {
            await resetAllSettings();
        }

        // Windows
        await commandsWindow.initialize();
        await runnerWindow.initialize();
        await aboutWindow.initialize();

        // Background Processes
        await keyboardShortcuts.initialize();

        if (isDev()) {
            await taskWindow.initialize();
            await receiveWindow.initialize();
            await sendWindow.initialize();
        }

        // Tray
        await defaultTray.initialize();
    }

    app.on('ready', onReady);
}
