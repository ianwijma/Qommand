import {createSettings} from "./createSettings";
import {
    CommandSettings,
    WindowManagementCommand,
    CommandId
} from "@qommand/common/src/settings/commands.settings.types";
import {ActiveWindowManagerMethod} from "../utils/activeWindowManager";

const addWindowManagementCommand = (name: string, method: ActiveWindowManagerMethod): {
    [key: CommandId]: WindowManagementCommand
} => ({
    [`window-management::${method}`]: {
        id: `window-management::${method}`,
        name,
        system: true,
        icon: '',
        type: 'window-management',
        aliases: [],
        hotkey: '',
        enabled: true,
        commandConfig: {
            method: method
        }
    }
})

export const commandsSettings = createSettings<CommandSettings>({
    name: 'commands',
    defaultSettings: {
        version: 1,
        commands: {}
    },
});