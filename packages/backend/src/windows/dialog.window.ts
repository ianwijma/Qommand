import {createWindow} from "./createWindow";
import {AnyObject} from '@qommand/common/src/object'
import {onButtonClickedEvent} from '@qommand/common/src/events/buttonClicked.event'
import {nanoid} from "nanoid";
import {responseHandler} from "../utils/responseHandler";
import {dialogRequestName, DialogRequestRes, DialogRequestReq} from '@qommand/common/src/requests/dialog.request';
import {OpenDialogOptions} from '@qommand/common/src/dialog'
import {SimpleEventBusData} from "@qommand/common/src/eventbus.types";

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
        open: (urlParams: OP): Promise<OR> => {
            return new Promise<OR>(async (resolve) => {
                const dialogId = nanoid();
                const {open, close, initialize, getWindow} = createWindow({
                    title,
                    route,
                    resizable: false,
                    width: 512,
                    height: 256,
                    minWidth: 512,
                    minHeight: 256,
                });

                const closeAndClean = async () => {
                    await close();

                    const window = getWindow();

                    window.destroy();
                }

                await initialize();

                const resolveButtonId = (buttonAction: string): string => `${buttonAction}::${dialogId}`
                const unsubscribe = onButtonClickedEvent((buttonAction, buttonData: OR) => {
                    console.log('onButtonClickedEvent', buttonAction, buttonData);
                    switch (buttonAction) {
                        case resolveButtonId('cancel'): {
                            resolve(buttonData);
                            unsubscribe();
                            closeAndClean();
                        }
                            break;
                        case resolveButtonId('ok'): {
                            resolve(buttonData);
                            unsubscribe();
                            closeAndClean();
                        }
                            break;
                    }
                })

                await open({urlParams: {...urlParams, dialogId}});
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

const dialogMap = {
    input: inputDialog,
}

responseHandler.handleResponse<DialogRequestReq<OpenDialogOptions>, DialogRequestRes<SimpleEventBusData>>(dialogRequestName, () => true, async (data) => {
    const {dialog} = data;
    const {type, ...rest} = dialog;

    if (type in dialogMap) {
        const dialogHandler = dialogMap[type];
        return await dialogHandler.open(rest)
    }

    return null
})
