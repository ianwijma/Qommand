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
}

type OpenParams = AnyObject<string, string>;
type CreateDialogReturn<OP extends OpenParams, OR extends AnyObject> = {
    open: (params: OP) => Promise<OR>;
}


const createDialog = <OP extends OpenParams, OR extends AnyObject>({
                                                                       title,
                                                                       route
                                                                   }: CreateDialogParams): CreateDialogReturn<OP, OR> => {
    return {
        open: (options: OP): Promise<OR> => {
            return new Promise<OR>(async (resolve) => {
                const {open, destroy, initialize, getUniqueWindowId} = createWindow({
                    title,
                    route,
                    resizable: false,
                    width: 512,
                    height: 256,
                    minWidth: 512,
                    minHeight: 256,
                });

                await initialize();

                const dialogId = getUniqueWindowId();

                const resolveButtonId = (buttonId: string): string => `${buttonId}::${dialogId}`
                const stopListening = eventHandler.listen<ButtonClickedEventData>(buttonClickedEventName, (data) => {
                    const {buttonId: currentButtonId, buttonData} = data;

                    switch (currentButtonId) {
                        case resolveButtonId('cancel'): {
                            resolve(buttonData as OR);
                            stopListening();
                            destroy();
                        }
                            break;
                        case resolveButtonId('ok'): {
                            resolve(buttonData as OR);
                            stopListening();
                            destroy();
                        }
                            break;
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
    inputPlaceholder?: string
};
type SimpleInputReturn = {
    input: string
};

export const inputDialog = createDialog<SimpleInputParams, SimpleInputReturn>({
    title: 'Input Dialog',
    route: 'dialog/input',
});

type CreateTaskParams = {};
type CreateTaskReturn = {
    input: string,
    type: string,
};

export const createTaskDialog = createDialog<CreateTaskParams, CreateTaskReturn>({
    title: 'Create Tasks Dialog',
    route: 'dialog/create-task',
});

const dialogMap = {
    input: inputDialog,
    'create-task': createTaskDialog,
}

responseHandler.handleResponse<DialogRequestReq<OpenDialogOptions>, DialogRequestRes<SimpleEventBusData>>(dialogRequestName, () => true, async (data) => {
    const {dialog} = data;
    const {type, ...rest} = dialog;

    if (type in dialogMap) {
        const dialogHandler = dialogMap[type];
        // @ts-expect-error - rest can be either createTaskDialog of inputDialog, which makes rest unhappy.
        return dialogHandler.open(rest)
    }

    return null
})
