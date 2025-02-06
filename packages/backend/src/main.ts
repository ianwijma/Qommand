import {app} from 'electron';
import started from 'electron-squirrel-startup';
import {receiveWindow} from "./windows/receive.window";
import {sendWindow} from "./windows/send.window";
import {defaultTray} from "./tray/defaultTray";
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
import {searchSettings} from "./settings/search.setting";
import {commandRunner} from "./utils/commandRunner";
import {nodeRed} from "./utils/nodeRed";
import {activeWindowManager} from "./utils/activeWindowManager";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
    app.quit();
}

let isSingleInstance = app.requestSingleInstanceLock()
if (!isSingleInstance) {
    console.log('Qommand can only be opened once.')
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
        await searchSettings.initialize();

        if (startupArguments.reset) {
            await resetAllSettings();
        }

        // Windows
        await commandsWindow.initialize();
        await runnerWindow.initialize();
        await aboutWindow.initialize();

        // Background Processes
        // TODO: Resolve post-build error: (node:224924) UnhandledPromiseRejectionWarning: Error: Cannot find module '@node-red/nodes'
        await nodeRed.initialize().catch(console.error);
        await keyboardShortcuts.initialize();
        await commandRunner.initialize();
        await activeWindowManager.initialize();

        if (isDev()) {
            await receiveWindow.initialize();
            await sendWindow.initialize();
        }

        // Tray
        await defaultTray.initialize();
    }

    app.on('ready', onReady);
}
