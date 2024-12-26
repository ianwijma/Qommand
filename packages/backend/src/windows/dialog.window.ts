import {createWindow} from "./createWindow";
import {AnyObject} from '@qommand/common/src/object'
import {onButtonClickedEvent} from '@qommand/common/src/events/buttonClicked.event'
import {nanoid} from "nanoid";

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
                const {open, close, initialize} = createWindow({
                    title,
                    route,
                    resizable: false,
                    width: 512,
                    height: 256,
                    minWidth: 512,
                    minHeight: 256,
                });

                await initialize();

                const resolveButtonId = (buttonAction: string): string => `${buttonAction}::${dialogId}`
                onButtonClickedEvent((buttonAction, buttonData: OR) => {
                    console.log(buttonAction, buttonData);
                    switch (buttonAction) {
                        case resolveButtonId('cancel'): {
                            resolve(buttonData);
                            close();
                        }
                            break;
                        case resolveButtonId('ok'): {
                            resolve(buttonData);
                            close();
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

export const simpleInputDialog = createDialog<SimpleInputParams, SimpleInputReturn>({
    title: 'Input Dialog',
    route: 'dialog/input',
});