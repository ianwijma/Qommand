import {BaseClipboardHistoryItemHashId} from "../settings/clipboard-history.settings.types";

export const restoreClipboardHistoryEventName = 'updateSettings';

export type RestoreClipboardHistoryEventData = {
    clipboardHistoryItemHashId: BaseClipboardHistoryItemHashId;
}