import {windowClient, WindowClient} from "./windowClient";
import {responseHandler} from "./responseHandler";
import {
    windowManagerActionsRequestName,
    WindowManagerActionsRequestReq,
    WindowManagerActionsRequestRes
} from '@qommand/common/src/requests/windowManagerActions.request'

const createWindowManager = (client: WindowClient) => {

    return {
        initialize: async () => {
            await client.initialize();
        },
        maximize: async () => {
            console.log('WindowManager maximize', {windows: await client.getWindows()});
        },
    }
}

export const windowManager = createWindowManager(windowClient);
export type WindowManagerMethods = keyof typeof windowManager;

responseHandler.handleResponse<WindowManagerActionsRequestReq, WindowManagerActionsRequestRes>(windowManagerActionsRequestName, () => true, () => ({
    actions: Object.keys(windowManager).filter(method => method !== 'initialize') as WindowManagerMethods[]
}));