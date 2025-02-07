import {createSettings} from "./createSettings";
import {
    CommandSettings,
} from "@qommand/common/src/settings/commands.settings.types";

// const addWindowManagementCommand = (name: string, method: WindowManagerMethods): {
//     [key: CommandId]: WindowManagementCommand
// } => ({
//     [`window-management::${method}`]: {
//         id: `window-management::${method}`,
//         name,
//         system: true,
//         icon: '',
//         type: 'window-management',
//         aliases: [],
//         hotkey: '',
//         enabled: true,
//         commandConfig: {
//             method: method
//         }
//     }
// })

export const commandsSettings = createSettings<CommandSettings>({
    name: 'commands',
    defaultSettings: {
        version: 1,
        commands: {}
    },
});