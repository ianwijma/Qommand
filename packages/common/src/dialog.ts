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

type OpenConfirmDialogOptions = {
    type: 'confirm';
    title: string;
    message: string;
}

export type OpenDialogOptions = OpenInputDialogOptions | OpenCreateTaskDialogOptions | OpenConfirmDialogOptions;

export type OpenDialogResponse<T extends SimpleEventBusData> = {
    success: boolean;
    data?: T
    error?: Error
}

export const createOpenDialog = (responseHandler: ResponseHandler) => {
    return async <T extends SimpleEventBusData>(options: OpenDialogOptions): Promise<OpenDialogResponse<T>> => {
        try {
            const data = await responseHandler.requestResponse<DialogRequestRes<T>, DialogRequestReq<OpenDialogOptions>>(dialogRequestName, {
                dialog: options
            })

            return {
                success: true,
                data
            };
        } catch (error) {
            return {
                success: false,
                error
            }
        }
    }
}

