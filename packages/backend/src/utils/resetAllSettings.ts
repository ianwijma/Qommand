import {confirmDialog} from "../windows/dialog.window";
import {taskFolderSettings} from "../settings/folders.settings";
import {tasksSettings} from "../settings/tasks.setting";

export const resetAllSettings = async () => {
    const {confirmed} = await confirmDialog.open({
        title: 'Reset all settings',
        message: 'Are you sure you want to reset all settings?',
    })

    if (confirmed) {
        await taskFolderSettings.resetSettings();
        await tasksSettings.resetSettings();
    }
}