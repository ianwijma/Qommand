import {keyboardSettings} from "../settings/keyboard.setting";
import {settingsUpdatedEventName, SettingsUpdatedEventData} from '@qommand/common/src/events/settingsUpdated.event'
import {KeyboardAction, KeyboardSettings} from "@qommand/common/src/settings/keyboard.settings.types";
import {globalShortcut} from 'electron'
import {runnerWindow} from "../windows/runner.window";
import {eventHandler} from "./eventHandler";
import {CommandId} from "@qommand/common/src/settings/commands.settings.types";

export type KeyboardShortcuts = {
    initialize: () => Promise<void>,
}

const createKeyboardShortcuts = (): KeyboardShortcuts => {
    const handleCommand = async (commandId: CommandId): Promise<void> => {
        console.log('Handle Command', {commandId})
    }

    const handleWindow = async (id: string) => {
        switch (id) {
            case 'runner':
                await runnerWindow.toggle()
        }
    }

    const handleTrigger = async (action: KeyboardAction) => {
        const {target, targetId} = action;

        switch (target) {
            case "window":
                await handleWindow(targetId);
                break;
            case "commands":
                await handleCommand(targetId);
                break;
            default:
                console.error(`Unknown target ${target}`);
        }
    }

    const updateSettings = (settings: KeyboardSettings) => {
        const {shortcuts} = settings;

        globalShortcut.unregisterAll();

        Object.keys(shortcuts).forEach(accelerator => {
            const action = shortcuts[accelerator];

            if (globalShortcut.isRegistered(accelerator)) {
                console.log(`[keyboard-shortcut] accelerator "${accelerator}" already registered`, {action})
            } else {
                const success = globalShortcut.register(accelerator, () => {
                    console.log(`[keyboard-shortcut] Trigger accelerator "${accelerator}"`, {action});
                    handleTrigger(action);
                });

                // log success
                if (success) {
                    console.log(`[keyboard-shortcut] Successfully registered accelerator "${accelerator}"`, {action})
                } else {
                    console.log(`[keyboard-shortcut] Unable to register accelerator "${accelerator}"`, {action})
                }
            }
        });
    }

    return {
        initialize: async () => {
            // Handle updated settings
            eventHandler.listen<SettingsUpdatedEventData<KeyboardSettings>>(
                settingsUpdatedEventName,
                ({
                     settingName,
                     updatedSettings
                 }) => {
                    if (settingName === 'keyboard') {
                        updateSettings(updatedSettings);
                    }
                })

            // Initialize settings
            const settings = keyboardSettings.getSettings();
            updateSettings(settings);
        }
    };
}

export const keyboardShortcuts: KeyboardShortcuts = createKeyboardShortcuts();