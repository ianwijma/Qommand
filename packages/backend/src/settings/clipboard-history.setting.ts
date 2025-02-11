import {createSettings} from "./createSettings";
import {
    ClipboardHistoryItems,
    ClipboardHistorySettings
} from "@qommand/common/src/settings/clipboard-history.settings.types";
import {clipboardChanges} from "../utils/clipboard-changes-event";
import zlib from "node:zlib";
import {Buffer} from "node:buffer";
import {promisify} from 'node:util';

const compressPromiseFn = promisify(zlib.deflate);
const decompressPromiseFn = promisify(zlib.inflate);

const compress = async (input: string) => {
    const buffer = Buffer.from(input);
    const compressed = await compressPromiseFn(buffer);
    return compressed.toString('base64');
}

const decompress = async (input: string) => {
    const buffer = Buffer.from(input, 'base64');
    const decompressed = await decompressPromiseFn(buffer);
    return decompressed.toString();
}

const createSaveLoadFn = (name: 'compress' | 'decompress'): (data: ClipboardHistorySettings) => Promise<ClipboardHistorySettings> => {
    const compressDecompressFn = name === 'compress' ? compress : decompress;

    return async (settings) => {
        const {clipboardHistory} = settings;

        console.time(name);
        const compressedClipboardHistory = await Promise.all(clipboardHistory.map(async (item) => {
            const {type} = item;
            if (type === 'text' && item.text.length > 1000) {
                return {
                    ...item,
                    text: await compressDecompressFn(item.text),
                }
            }

            if (type === 'html' && item.html.length > 1000) {
                return {
                    ...item,
                    html: await compressDecompressFn(item.html),
                }
            }

            if (type === 'image') {
                return {
                    ...item,
                    image: await compressDecompressFn(item.image),
                }
            }

            return item;
        }));
        console.timeEnd(name);

        return {
            ...settings,
            clipboardHistory: compressedClipboardHistory
        };
    }
}


export const clipboardHistorySettings = createSettings<ClipboardHistorySettings>({
    name: 'clipboard',
    defaultSettings: {
        version: 1,
        clipboardHistory: []
    },
    preSaveFn: createSaveLoadFn('compress'),
    postLoadFn: createSaveLoadFn('decompress'),
});

const addClipboardHistoryItem = async (newItem: ClipboardHistoryItems) => {
    const settings = clipboardHistorySettings.getSettings();
    const {clipboardHistory} = settings;

    console.time('addClipboardHistoryItem');

    const cleanedClipboardHistory = clipboardHistory.filter(({id}, index) => {
        return id !== newItem.id && index < 101
    });

    console.timeLog('addClipboardHistoryItem', 'cleanedClipboardHistory');

    await clipboardHistorySettings.updateSettings({
        ...settings,
        clipboardHistory: [
            newItem,
            ...cleanedClipboardHistory
        ]
    });

    console.timeEnd('addClipboardHistoryItem');
}

clipboardChanges.onChange(async (event) => {
    const {type} = event;
    switch (type) {
        case 'text': {
            const {text, textHash} = event;
            const id = textHash;
            await addClipboardHistoryItem({type, id, textHash, text});
        }
            break;
        case 'html': {
            const {html, htmlHash, text, textHash} = event;
            const id = htmlHash;
            await addClipboardHistoryItem({type, id, htmlHash, textHash, html, text});
        }
            break;
        case 'image': {
            const {image, imageHash} = event;
            const id = imageHash;
            await addClipboardHistoryItem({type, id, imageHash, image: image.toDataURL()});
        }
            break;
        default: {
            console.log(`Unsupported event type ${type}`);
        }
    }
})