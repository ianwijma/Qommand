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
    const actuallyDefaultSettings: T = {...defaultSettings, name} as T;
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

        eventHandler.emit<SettingsUpdatedEventData<T>>(settingsUpdatedEventName, {
            settingName: name,
            updatedSettings
        });

        return updatedSettings;
    }

    const resetSettings = async () => {
        await writeYamlFile<T>(settingsFilePath, actuallyDefaultSettings);

        await syncSettings();

        const resetSettings = getSettings();

        eventHandler.emit<SettingsUpdatedEventData<T>>(settingsUpdatedEventName, {
            settingName: name,
            updatedSettings: resetSettings
        });

        return resetSettings;
    }

    responseHandler.handleResponse<SettingsRequestReq, SettingsRequestRes<T>>(settingsRequestName, (request) => {
        const {settingsName: currentSettingsName} = request;

        console.log('currentSettingsName', currentSettingsName, name);

        return currentSettingsName === name;
    }, (request) => {
        const settings = getSettings();

        console.log('handle', request, settings)

        return settings;
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