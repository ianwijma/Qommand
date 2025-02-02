import {createWindow} from "./createWindow";
import {AnyObject, stringifyObject} from '@qommand/common/src/object'
import {
    type ButtonClickedEventData,
    buttonClickedEventName,
} from '@qommand/common/src/events/buttonClicked.event'
import {responseHandler} from "../utils/responseHandler";
import {dialogRequestName, DialogRequestRes, DialogRequestReq} from '@qommand/common/src/requests/dialog.request';
import {OpenDialogOptions} from '@qommand/common/src/dialog'
import {SimpleEventBusData} from "@qommand/common/src/eventbus.types";
import {eventHandler} from "../utils/eventHandler";

type CreateDialogParams = {
    title: string;
    route: string;
    resizable?: boolean,
    width?: number,
    height?: number,
    minWidth?: number,
    minHeight?: number,
}

type OpenParams = AnyObject<string, string>;
type CreateDialogReturn<OP extends OpenParams, OR extends AnyObject> = {
    open: (params: OP) => Promise<OR>;
}

const createDialog = <OP extends OpenParams, OR extends AnyObject>({
                                                                       title,
                                                                       route,
                                                                       resizable = false,
                                                                       width = 512,
                                                                       height = 256,
                                                                       minWidth = 512,
                                                                       minHeight = 256,
                                                                   }: CreateDialogParams): CreateDialogReturn<OP, OR> => {
    return {
        open: (options: OP): Promise<OR> => {
            return new Promise<OR>(async (resolve, reject) => {
                const {open, destroy, initialize, getUniqueWindowId} = createWindow({
                    title,
                    route,
                    resizable,
                    width,
                    height,
                    minWidth,
                    minHeight,
                });

                await initialize();

                const currentWindowId = getUniqueWindowId();

                const stopListening = eventHandler.listen<ButtonClickedEventData>(buttonClickedEventName, (data) => {
                    const {buttonId, windowId, buttonData} = data;

                    if (parseInt(windowId, 10) === currentWindowId) {
                        switch (buttonId) {
                            case 'confirm': {
                                resolve(buttonData as OR);
                                stopListening();
                                destroy();
                            }
                                break;
                            case 'cancel': {
                                reject();
                                stopListening();
                                destroy();
                            }
                                break;
                        }
                    }


                });

                await open({urlParams: stringifyObject(options)});
            })
        },
    }
}

type SimpleInputParams = {
    title: string;
    message: string;
    placeholder?: string
    value?: string
};
type SimpleInputReturn = {
    input: string
};

export const inputDialog = createDialog<SimpleInputParams, SimpleInputReturn>({
    title: 'Input Dialog',
    route: 'dialog/input',
});

type CreateCommandParams = {};
type CreateCommandReturn = {
    name: string,
    type: string,
};

export const createCommandDialog = createDialog<CreateCommandParams, CreateCommandReturn>({
    title: 'Create Command Dialog',
    route: 'dialog/create-command',
});

type ConfirmParams = {
    title: string;
    message: string;
};
type ConfirmReturn = {
    confirmed: boolean;
};

export const confirmDialog = createDialog<ConfirmParams, ConfirmReturn>({
    title: 'Confirm Dialog',
    route: 'dialog/confirm',
});

type EditCommandParams = {
    commandId: string;
    title: string;
};
type EditCommandReturn = {};

export const editCommandDialog = createDialog<EditCommandParams, EditCommandReturn>({
    title: 'Edit Command',
    route: 'dialog/edit-command',
    resizable: true,
    width: 1080,
    height: 640,
    minWidth: 1080,
    minHeight: 640,
});

const dialogMap = {
    input: inputDialog,
    'create-command': createCommandDialog,
    'confirm': confirmDialog,
    'edit-command': editCommandDialog,
}

responseHandler.handleResponse<DialogRequestReq<OpenDialogOptions>, DialogRequestRes<SimpleEventBusData>>(dialogRequestName, () => true, async (data) => {
    const {dialog} = data;
    const {type, ...rest} = dialog;

    if (type in dialogMap) {
        const dialogHandler = dialogMap[type];

        // @ts-expect-error - rest is always correct
        return dialogHandler.open(rest)
    }

    return null
})
