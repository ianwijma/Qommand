import {fileExists, readYamlFile, writeYamlFile} from "../utils/files";
import {BaseSettings} from "@qommand/common/src/settings.types";
import {responseHandler} from "../utils/responseHandler";
import {eventHandler} from "../utils/eventHandler";
import {settingsUpdatedEventName, type SettingsUpdatedEventData} from '@qommand/common/src/events/settingsUpdated.event'
import {updateSettingsEventName, type UpdateSettingsEventData} from '@qommand/common/src/events/updateSettings.event'
import {
    settingsRequestName,
    type SettingsRequestReq,
    type SettingsRequestRes
} from '@qommand/common/src/requests/settings.request'

export type SettingsName = string;

type CreateSettingParams<T> = {
    name: SettingsName;
    defaultSettings: Omit<T, "name">;
}

export type CreateSettingReturn<T> = {
    name: SettingsName;
    initialize: () => Promise<void>;
    getSettings: () => T;
    syncSettings: () => Promise<void>;
    updateSettings: (updatedSettings: T) => Promise<T>;
    resetSettings: () => Promise<T>;
}

export const createSettings = <T extends BaseSettings>({
                                                           name,
                                                           defaultSettings
                                                       }: CreateSettingParams<T>): CreateSettingReturn<T> => {
    const actuallyDefaultSettings: T = {name, ...defaultSettings} as T;
    const settingsFilePath = `settings/${name}.yaml`;
    let settingsCache: T;

    const isInitialized = () => {
        if (!settingsCache) throw new Error(`Setting ${name} was not initialized`);
    }

    const initialize = async () => {
        console.info(`Initializing ${name} settings`);

        await syncSettings();
    }

    const getSettings = () => {
        isInitialized();

        return settingsCache;
    };

    const syncSettings = async () => {
        const settingsFileExists = await fileExists(settingsFilePath);
        if (!settingsFileExists) {
            await writeYamlFile<T>(settingsFilePath, actuallyDefaultSettings);
        }

        settingsCache = await readYamlFile<T>(settingsFilePath);
    }

    const updateSettings = async (settingToUpdate: T): Promise<T> => {
        await writeYamlFile<T>(settingsFilePath, settingToUpdate);

        await syncSettings();

        const updatedSettings = getSettings();

        console.log('Settings updated', {name, settings: JSON.stringify(updatedSettings)});
        eventHandler.emit<SettingsUpdatedEventData<T>>(settingsUpdatedEventName, {
            settingName: name,
            updatedSettings,
            type: 'update',
        });

        return updatedSettings;
    }

    const resetSettings = async () => {
        await writeYamlFile<T>(settingsFilePath, actuallyDefaultSettings);

        await syncSettings();

        const resettedSettings = getSettings();

        console.log('Settings reset', {name, settings: JSON.stringify(resettedSettings)});
        eventHandler.emit<SettingsUpdatedEventData<T>>(settingsUpdatedEventName, {
            settingName: name,
            updatedSettings: resettedSettings,
            type: 'reset'
        });

        return resettedSettings;
    }

    responseHandler.handleResponse<SettingsRequestReq, SettingsRequestRes<T>>(settingsRequestName, (request) => {
        const {settingsName: currentSettingsName} = request;

        return currentSettingsName === name;
    }, () => {
        return getSettings();
    });

    eventHandler.listen<UpdateSettingsEventData<T>>(updateSettingsEventName, (event) => {
        const {settingsName, settingsToUpdate} = event;

        if (settingsName !== name) return;

        updateSettings(settingsToUpdate);
    })

    return {
        name,
        initialize,
        getSettings,
        syncSettings,
        updateSettings,
        resetSettings
    }
}