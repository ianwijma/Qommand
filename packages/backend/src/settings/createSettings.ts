import {fileExists, readYamlFile, writeYamlFile} from "../utils/files";
import {BaseSettings} from "@qommand/common/src/settings.types";
import {emitSettingUpdatedEvent} from '@qommand/common/src/events/settingUpdated.event'
import {logger} from "../utils/logger";

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
        logger.info(`Initializing ${name} settings`);

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

        const updatedSetting = getSettings();

        emitSettingUpdatedEvent(name, updatedSetting);

        return updatedSetting;
    }

    const resetSettings = async () => {
        await writeYamlFile<T>(settingsFilePath, actuallyDefaultSettings);

        await syncSettings();

        const resetSettings = getSettings();

        emitSettingUpdatedEvent(name, resetSettings);

        return resetSettings;
    }

    return {
        name,
        initialize,
        getSettings,
        syncSettings,
        updateSettings,
        resetSettings
    }
}