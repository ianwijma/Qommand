import {SimpleEventBusData} from "@qommand/common/src/eventbus.types";
import {dialogRequestName, DialogRequestRes, DialogRequestReq} from '@qommand/common/src/requests/dialog.request';
import {ResponseHandler} from "./createResponseHandler";

type OpenInputDialogOptions = {
    type: 'input';
    title: string;
    message: string;
}

type OpenCreateTaskDialogOptions = {
    type: 'create-task';
}

export type OpenDialogOptions = OpenInputDialogOptions | OpenCreateTaskDialogOptions;

export type OpenDialogResponse<T extends SimpleEventBusData> = {
    success: boolean;
    data?: T
}

export const createOpenDialog = (responseHandler: ResponseHandler) => {
    return async <T extends SimpleEventBusData>(options: OpenDialogOptions): Promise<OpenDialogResponse<T>> => {
        const data = await responseHandler.requestResponse<DialogRequestRes<T>, DialogRequestReq<OpenDialogOptions>>(dialogRequestName, {
            dialog: options
        })

        if (data) {
            return {
                success: true,
                data
            }
        }

        return {
            success: false,
            data
        }
    }
}

