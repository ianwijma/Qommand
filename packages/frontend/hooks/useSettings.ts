import {useEffect, useState} from "react";
import {BaseSettings} from "@qommand/common/src/settings.types";
import {SettingsName} from "qommand/src/settings/createSettings";
import {isClient} from "../utils/isClient";
import {eventHandler} from "../utils/eventHandler";
import {settingsUpdatedEventName, type SettingsUpdatedEventData} from '@qommand/common/src/events/settingsUpdated.event'
import {updateSettingsEventName, type UpdateSettingsEventData} from '@qommand/common/src/events/updateSettings.event'
import {
    settingsRequestName,
    type SettingsRequestReq,
    type SettingsRequestRes
} from '@qommand/common/src/requests/settings.request'
import {responseHandler} from "../utils/responseHandler";

export const useSettings = <T extends BaseSettings>(settingsName: SettingsName) => {
    const [settings, setSettings] = useState<T>(null);
    const isLoading = settings === null;

    const initializeSettings = async () => {
        const initialSettings = await responseHandler.requestResponse<SettingsRequestRes<T>, SettingsRequestReq>(
            settingsRequestName,
            {settingsName},
            {timeout: 200}
        );

        setSettings(initialSettings);
    }

    useEffect(() => {
        if (!isClient) return;

        eventHandler.listen<SettingsUpdatedEventData<T>>(settingsUpdatedEventName, (response) => {
            const {updatedSettings} = response;
            const {name} = updatedSettings;

            if (name === settingsName) {
                setSettings(updatedSettings);
            }
        });

        initializeSettings();
    }, []);

    const updateSettings = (settingsToUpdate: T) => {
        console.log('settingsToUpdate', settingsToUpdate);
        eventHandler.emit<UpdateSettingsEventData<T>>(updateSettingsEventName, {
            settingsName,
            settingsToUpdate
        });
    }

    return {
        isLoading,
        settings,
        updateSettings
    }
}