import {FolderName, FolderSettings} from "@qommand/common/src/settings/folders.settings.types";
import {createSettings} from "./createSettings";

const createFolderSettings = (folderName: FolderName) => {
    const settingName = `folder-${folderName}`;
    return createSettings<FolderSettings>({
        name: settingName,
        defaultSettings: {
            version: 1,
            subFolders: {}
        }
    });
}

export const commandsFolderSettings = createFolderSettings('commands');
