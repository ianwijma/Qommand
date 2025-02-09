import {BaseSettings} from "../settings.types";

export type BaseClipboardHistoryItem = {}

export type ClipboardHistoryItemText = BaseClipboardHistoryItem & {}
export type ClipboardHistoryItemHtml = BaseClipboardHistoryItem & {}
export type ClipboardHistoryItemImage = BaseClipboardHistoryItem & {}

export type ClipboardHistoryItem = ClipboardHistoryItemText | ClipboardHistoryItemHtml | ClipboardHistoryItemImage

export type ClipboardHistorySettings = BaseSettings & {
    selectionHistory: ClipboardHistoryItem[];
    clipboardHistory: ClipboardHistoryItem[];
};