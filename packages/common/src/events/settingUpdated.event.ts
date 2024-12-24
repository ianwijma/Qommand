import {EventType} from "../events.types";
import {SettingsName} from "qommand/src/settings/createSettings";
import {BaseSettings} from "../settings.types";
import {emitEvent, subscribe} from "../eventSubscriptions";

export const SettingUpdatedEvent: EventType = {
    name: 'settingUpdated',
};

export const emitSettingUpdatedEvent = <T extends BaseSettings>(settingsName: SettingsName, updatedSettings: T) => {
    emitEvent(SettingUpdatedEvent, settingsName, updatedSettings);
}

export const onSettingsUpdated = <T extends BaseSettings>(callback: (settingName: string, updatedSetting: T) => void) => {
    subscribe(SettingUpdatedEvent, {
        0: (_, settingName: string, updatedSetting: T) => callback(settingName, updatedSetting),
    })
}