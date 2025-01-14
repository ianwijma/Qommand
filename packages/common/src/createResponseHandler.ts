import {SimpleEventBusData} from "./eventbus.types";
import {nanoid} from "nanoid";
import {EventHandler} from "./createEventHandler";

export type RequestResponseOptions = {
    timeout?: number;
}

export type ResponseHandler = {
    requestResponse: <RES extends SimpleEventBusData, REQ extends SimpleEventBusData = SimpleEventBusData>(requestName: string, data: REQ, options?: RequestResponseOptions) => Promise<RES>;
    handleResponse: <REQ extends SimpleEventBusData, RES extends SimpleEventBusData = SimpleEventBusData>(requestName: string, shouldHandleCallback: (data: REQ) => boolean, callback: (data: REQ) => RES | Promise<RES>) => void;
}

type RequestObject<T extends SimpleEventBusData = SimpleEventBusData> = {
    requestId: string;
    data?: T;
}

type ResponseObject<T extends SimpleEventBusData = SimpleEventBusData> = {
    requestId: string;
    success?: boolean;
    data?: T;
}

export const createResponseHandler = (eventHandler: EventHandler): ResponseHandler => {
    return {
        requestResponse: <RES extends SimpleEventBusData, REQ extends SimpleEventBusData = SimpleEventBusData>(requestName: string, requestData: REQ, options: RequestResponseOptions = {}) => {
            const requestId = nanoid();

            // console.log('requestResponse - init', requestName, requestId, requestData);

            const REQUEST_NAME = `${requestName}-request`;
            const RESPONSE_NAME = `${requestName}-response`;

            return new Promise((resolve, reject) => {

                let done = false;

                const stopListening = eventHandler.listen<ResponseObject<RES>>(RESPONSE_NAME, (response) => {
                    // console.log('requestResponse - listen', requestName, requestId, response);
                    const {requestId: currentRequestId, data: responseData, success} = response;

                    if (currentRequestId === requestId) {
                        stopListening();

                        if (success) {
                            // @ts-ignore - IDK why TS is sad, the data is of correct type...
                            resolve(responseData);
                        } else {
                            reject('ResponseHandler - fetch failure');
                        }

                        done = true;
                    }
                });

                // console.log('requestResponse - emit', requestName, requestId, requestData);
                eventHandler.emit<RequestObject<REQ>>(REQUEST_NAME, {
                    requestId,
                    data: requestData
                })

                if ('timeout' in options && options.timeout > 0) {
                    setTimeout(() => {
                        // console.log('requestResponse - timeout', requestName, requestId, done, requestData);
                        if (!done) reject('ResponseHandler - Timed out')
                    }, options.timeout);
                }
            })
        },
        handleResponse: <REQ extends SimpleEventBusData, RES extends SimpleEventBusData = SimpleEventBusData>(requestName: string, shouldHandleCallback: (data: REQ) => boolean, callback: (data: REQ) => RES | Promise<RES>) => {
            // console.log('handleResponse - init', requestName, requestName, shouldHandleCallback, callback);

            const REQUEST_NAME = `${requestName}-request`;
            const RESPONSE_NAME = `${requestName}-response`;

            eventHandler.listen<RequestObject<REQ>>(REQUEST_NAME, async (request) => {
                const {requestId, data} = request;

                const shouldHandleRequest = shouldHandleCallback(data);
                // console.log('handleResponse - listen', requestName, requestId, request, shouldHandleRequest);

                if (shouldHandleRequest) {
                    try {
                        const responseData = await callback(data);

                        // console.log('handleResponse - emit', requestName, requestId, responseData);
                        eventHandler.emit<ResponseObject<RES>>(RESPONSE_NAME, {
                            requestId,
                            success: true,
                            data: responseData,
                        });
                    } catch (error) {
                        // console.log('handleResponse - emit - ERROR', requestName, requestId, error);
                        eventHandler.emit<ResponseObject<RES>>(RESPONSE_NAME, {
                            requestId,
                            success: false,
                        });
                    }
                }

            });
        }
    }
}