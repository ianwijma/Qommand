import {createSettings} from "./createSettings";
import {ClipboardHistorySettings} from "@qommand/common/src/settings/clipboard-history.settings.types";
import {clipboardChanges} from "../utils/clipboard-changes-event";

export const clipboardHistorySettings = createSettings<ClipboardHistorySettings>({
    name: 'clipboard',
    defaultSettings: {
        version: 1,
        selectionHistory: [],
        clipboardHistory: []
    },
});

clipboardChanges.onChange((type) => {
    console.log("change", type);
});

clipboardChanges.startListening();