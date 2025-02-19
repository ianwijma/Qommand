import {useEffect, useState} from "react";
import {BaseSettings} from "@qommand/common/src/settings.types";
import {SettingsName} from "qommand/src/settings/createSettings";
import {eventHandler} from "../utils/eventHandler";
import {settingsUpdatedEventName, type SettingsUpdatedEventData} from '@qommand/common/src/events/settingsUpdated.event'
import {updateSettingsEventName, type UpdateSettingsEventData} from '@qommand/common/src/events/updateSettings.event'
import {
    settingsRequestName,
    type SettingsRequestReq,
    type SettingsRequestRes
} from '@qommand/common/src/requests/settings.request'
import {responseHandler} from "../utils/responseHandler";
import {useListen} from "./useEventHandler";

export const useSettings = <T extends BaseSettings>(settingsName: SettingsName) => {
    const [settings, setSettings] = useState<T>(null);
    const isLoading = settings === null;

    const initializeSettings = async () => {
        const initialSettings = await responseHandler.requestResponse<SettingsRequestRes<T>, SettingsRequestReq>(
            settingsRequestName,
            {settingsName},
            {timeout: 200}
        );

        console.log('Setting Initialised', {
            settingsName,
            initialSettings
        });

        setSettings(initialSettings);
    }

    useListen<SettingsUpdatedEventData<T>>(settingsUpdatedEventName, (response) => {
        const {updatedSettings} = response;
        const {name} = updatedSettings;

        if (name === settingsName) {
            console.log('Setting Updated', {
                settingsName,
                name,
                updatedSettings
            });
            setSettings(updatedSettings);
        }
    })

    useEffect(() => {
        initializeSettings();
    }, []);

    const updateSettings = (settingsToUpdate: T) => {
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