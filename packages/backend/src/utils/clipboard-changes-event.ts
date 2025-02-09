import EventEmitter from "node:events";
import {clipboard, NativeImage} from "electron";
import {createHash} from 'node:crypto';

const hash = (input: string): string => {
    const hash = createHash('SHA1');
    hash.write(input);
    return hash.digest('hex');
}

type ClipboardChangeEventTypes = 'text' | 'image' | 'html';
type ClipboardChangeData = string | NativeImage;
type ClipboardChangesEventDetails = { type: ClipboardChangeEventTypes, clipboard: ClipboardChangeData };
type ClipboardChangesEvent = CustomEvent<ClipboardChangesEventDetails>;

const createClipboardChanges = () => {
    const eventEmitter = new EventEmitter();

    const emit = (type: ClipboardChangeEventTypes, clipboard: ClipboardChangeData) => {
        const event = new CustomEvent<ClipboardChangesEventDetails>('change', {
            detail: {type, clipboard},
        });

        eventEmitter.emit<ClipboardChangesEvent>('change', event);
    }

    let intervalId: undefined | number;

    return {
        startListening: () => {
            const htmlInitial = clipboard.readHTML('clipboard');
            const textInitial = clipboard.readText('clipboard');
            const imageInitial = clipboard.readImage('clipboard');

            console.log('Initial Check', {
                htmlInitial, textInitial
            })

            let htmlHash = hash(htmlInitial);
            let textHash = hash(textInitial);
            let imageHash = hash(imageInitial.toDataURL());

            if (!intervalId) {
                // @ts-expect-error - Expects a NodeJS.Timeout?
                intervalId = setInterval(() => {
                    const html = clipboard.readHTML('clipboard');
                    const text = clipboard.readText('clipboard');
                    const image = clipboard.readImage('clipboard');
                    
                    const newHtmlHash = hash(html);
                    const newTextHash = hash(text);
                    const newImageHash = hash(image.toDataURL());

                    console.log('check-change', {
                        text, html
                    })

                    if (newHtmlHash !== htmlHash) {
                        htmlHash = newHtmlHash;
                        emit('html', html);
                    } else if (newTextHash !== textHash) {
                        textHash = newTextHash;
                        emit('text', text);
                    } else if (newImageHash !== imageHash) {
                        imageHash = newImageHash;
                        emit('image', image);
                    }
                }, 2500);
            }
        },
        stopListening: () => {
            if (intervalId) {
                intervalId = undefined;

                clearInterval(intervalId);
            }
        },
        onChange: (callback: (type: ClipboardChangeEventTypes) => Promise<void> | void) => {
            eventEmitter.on<ClipboardChangesEvent>('change', (event) => {
                console.log('event', {event});
            });
        }
    }
}

export const clipboardChanges = createClipboardChanges();