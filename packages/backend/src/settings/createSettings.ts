import {fileExists, readYamlFile, writeYamlFile} from "../utils/files";
import {BaseSettings} from "@qommand/common/src/settings.types";

type CreateSettingParams<T> = {
    name: string;
    defaultSettings: T
}

type CreateSettingReturn<T> = {
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
    const settingsFilePath = `settings/${name}.yaml`;
    let settingsCache: T;

    const isInitialized = () => {
        if (!settingsCache) throw new Error(`Setting ${name} was not initialized`);
    }

    const initialize = async () => {
        console.log(`Initializing ${name} settings`);

        await syncSettings();
    }

    const getSettings = () => {
        isInitialized();

        return settingsCache;
    };

    const syncSettings = async () => {
        const settingsFileExists = await fileExists(settingsFilePath);
        if (!settingsFileExists) {
            await writeYamlFile<T>(settingsFilePath, defaultSettings);
        }

        settingsCache = await readYamlFile<T>(settingsFilePath);
    }

    const updateSettings = async (updatedSettings: T): Promise<T> => {
        await writeYamlFile<T>(settingsFilePath, updatedSettings);

        await syncSettings();

        return getSettings();
    }

    const resetSettings = async () => {
        await writeYamlFile<T>(settingsFilePath, defaultSettings);

        await syncSettings();

        return getSettings();
    }

    return {
        initialize,
        getSettings,
        syncSettings,
        updateSettings,
        resetSettings
    }
}