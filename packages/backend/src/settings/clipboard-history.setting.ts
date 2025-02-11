import {createSettings} from "./createSettings";
import {
    ClipboardHistoryItems,
    ClipboardHistorySettings
} from "@qommand/common/src/settings/clipboard-history.settings.types";
import {clipboardChanges} from "../utils/clipboard-changes-event";

export const clipboardHistorySettings = createSettings<ClipboardHistorySettings>({
    name: 'clipboard',
    defaultSettings: {
        version: 1,
        clipboardHistory: []
    },
});

const addClipboardHistoryItem = async (newItem: ClipboardHistoryItems) => {
    const settings = clipboardHistorySettings.getSettings();
    const {clipboardHistory} = settings;

    const cleanedClipboardHistory = clipboardHistory.filter(({id}, index) => {
        return id !== newItem.id && index < 501
    });

    await clipboardHistorySettings.updateSettings({
        ...settings,
        clipboardHistory: [
            newItem,
            ...cleanedClipboardHistory
        ]
    })
}

clipboardChanges.onChange(async (event) => {
    const {type} = event;
    switch (type) {
        case 'text': {
            const {text, textHash} = event;
            const id = textHash;
            await addClipboardHistoryItem({type, id, text, textHash});
        }
            break;
        case 'html': {
            const {html, htmlHash, text, textHash} = event;
            const id = htmlHash;
            await addClipboardHistoryItem({type, id, html, htmlHash, text, textHash});
        }
            break;
        case 'image': {
            const {image, imageHash} = event;
            const id = imageHash;
            await addClipboardHistoryItem({type, id, image: image.toDataURL(), imageHash});
        }
            break;
        default: {
            console.log(`Unsupported event type ${type}`);
        }
    }
})