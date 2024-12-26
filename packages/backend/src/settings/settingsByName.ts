import {CreateSettingReturn, SettingsName} from "./createSettings";
import {BaseSettings} from "@qommand/common/src/settings.types";
import {arrayToObjectBy} from "@qommand/common/src/array";
import * as settings from "./index";

// @ts-ignore Because we're importing * from an index file, TS can not ensure it's all the same type, which is fair enough.
// But we know better...
const settingsByName = arrayToObjectBy<CreateSettingReturn<BaseSettings>>(Object.values(settings), 'name')

export const getSettingByName = (settingName: SettingsName) => {
    if (settingName in settingsByName) {
        return settingsByName[settingName];
    } else {
        throw new Error(`Setting with ${settingName} does not exist, did not miss to add it to the settings/index.ts file?`);
    }
}