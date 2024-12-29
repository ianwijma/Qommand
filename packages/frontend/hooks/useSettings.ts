import {useEffect, useState} from "react";
import {BaseSettings} from "@qommand/common/src/settings.types";
import {SettingsName} from "qommand/src/settings/createSettings";
import {isClient} from "../utils/isClient";
import {logger} from "../utils/logger";

export const useSettings = <T extends BaseSettings>(settingsName: SettingsName) => {
    const [settings, setSettings] = useState<T>(null);
    const isLoading = settings === null;

    useEffect(() => {
        if (!isClient) return;

        // @ts-ignore
        window.settingsApi.onRequestReceived<T>(settingsName, setSettings);
        // @ts-ignore
        window.settingsApi.onSettingsUpdated<T>(settingsName, setSettings);
        // @ts-ignore
        window.settingsApi.requestSettings(settingsName);
    }, []);

    const updateSettings = (settingsToUpdate: T) => {
        logger.debug('settingsToUpdate', settingsToUpdate);
        // @ts-ignore
        window.settingsApi.updateSettings(settingsToUpdate);
    }

    return {
        isLoading,
        settings,
        updateSettings
    }
}