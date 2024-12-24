import {CreateSettingReturn} from "./createSettings";
import {BaseSettings} from "@qommand/common/src/settings.types";
import * as settings from "./index";

type SettingsByNameMap = { [name: string]: CreateSettingReturn<BaseSettings> }

export const settingsByName: SettingsByNameMap = Object.values(settings).reduce<SettingsByNameMap>((map, settings) => {
    map[settings.name] = settings;

    return map;
}, {})