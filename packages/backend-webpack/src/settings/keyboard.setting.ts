import {createSettings} from "./createSettings";
import {KeyboardSettings} from "@qommand/common/src/settings/keyboard.settings.types";
import {isMac} from "../utils/isMac";

export const keyboardSettings = createSettings<KeyboardSettings>({
    name: 'keyboard',
    defaultSettings: {
        version: 1,
        shortcuts: {
            [isMac() ? 'Control+m' : 'Control+m']: {
                target: 'window',
                targetId: 'runner'
            }
        }
    },
});