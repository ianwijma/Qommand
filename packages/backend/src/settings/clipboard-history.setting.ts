import {createSettings} from "./createSettings";
import {
    ClipboardHistoryItems,
    ClipboardHistorySettings
} from "@qommand/common/src/settings/clipboard-history.settings.types";
import {clipboardChanges} from "../utils/clipboard-changes-event";
import zlib from "node:zlib";
import {Buffer} from "node:buffer";
import {promisify} from 'node:util';

const compress = promisify(zlib.deflate);
const decompress = promisify(zlib.inflate);

const createSaveLoadFn = (compressDecompressFn: typeof compress | typeof decompress): (data: ClipboardHistorySettings) => Promise<ClipboardHistorySettings> => {
    return async (settings) => {
        const {clipboardHistory} = settings;

        const compressedClipboardHistory = await Promise.all(clipboardHistory.map(async (item) => {
            const {type} = item;
            if (type === 'html' && item.html.length > 1000) {
                const htmlBuffer = Buffer.from(item.html);
                const htmlCompressed = await compressDecompressFn(htmlBuffer);

                return {
                    ...item,
                    html: htmlCompressed.toString(),
                }
            }

            if (type === 'image') {
                const imageBuffer = Buffer.from(item.image);
                const imageCompressed = await compressDecompressFn(imageBuffer);

                return {
                    ...item,
                    image: imageCompressed.toString(),
                }
            }

            return item;
        }));

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
    preSaveFn: createSaveLoadFn(compress),
    postLoadFn: createSaveLoadFn(decompress),
});

const addClipboardHistoryItem = async (newItem: ClipboardHistoryItems) => {
    const settings = clipboardHistorySettings.getSettings();
    const {clipboardHistory} = settings;

    const cleanedClipboardHistory = clipboardHistory.filter(({id}, index) => {
        return id !== newItem.id && index < 101
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