import {confirmDialog} from "../windows/dialog.window";
import {commandsFolderSettings} from "../settings/folders.settings";
import {commandsSettings} from "../settings/commands.setting";
import {keyboardSettings} from "../settings/keyboard.setting";

export const resetAllSettings = async () => {
    const {confirmed} = await confirmDialog.open({
        title: 'Reset all settings',
        message: 'Are you sure you want to reset all settings?',
    })

    if (confirmed) {
        await keyboardSettings.resetSettings();
        await commandsFolderSettings.resetSettings();
        await commandsSettings.resetSettings();
    }
}