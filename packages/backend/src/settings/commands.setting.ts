import {createSettings} from "./createSettings";
import {CommandSettings} from "@qommand/common/src/settings/commands.settings.types";


export const commandsSettings = createSettings<CommandSettings>({
    name: 'commands',
    defaultSettings: {
        version: 1,
        commands: {}
    },
});