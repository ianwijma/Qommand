import {confirmDialog} from "../windows/dialog.window";
import {commandsFolderSettings, taskFolderSettings} from "../settings/folders.settings";
import {tasksSettings} from "../settings/tasks.setting";
import {commandsSettings} from "../settings/commands.setting";

export const resetAllSettings = async () => {
    const {confirmed} = await confirmDialog.open({
        title: 'Reset all settings',
        message: 'Are you sure you want to reset all settings?',
    })

    if (confirmed) {
        await taskFolderSettings.resetSettings();
        await tasksSettings.resetSettings();
        await commandsFolderSettings.resetSettings();
        await commandsSettings.resetSettings();
    }
}