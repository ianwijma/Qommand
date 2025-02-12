import {confirmDialog} from "../windows/dialog.window";
import {commandsFolderSettings} from "../settings/folders.settings";
import {commandsSettings} from "../settings/commands.setting";
import {keyboardSettings} from "../settings/keyboard.setting";
import {clipboardHistorySettings} from "../settings/clipboard-history.setting";
import {searchSettings} from "../settings/search.setting";

export const resetAllSettings = async () => {
    const {confirmed} = await confirmDialog.open({
        title: 'Reset all settings',
        message: 'Are you sure you want to reset all settings?',
    })

    if (confirmed) {
        await keyboardSettings.resetSettings();
        await commandsFolderSettings.resetSettings();
        await commandsSettings.resetSettings();
        await searchSettings.resetSettings();
        await clipboardHistorySettings.resetSettings();
    }
}