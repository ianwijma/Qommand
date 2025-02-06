import {windowManager} from "node-window-manager";
import {responseHandler} from "./responseHandler";
import {
    windowManagerActionsRequestName,
    WindowManagerActionsRequestReq,
    WindowManagerActionsRequestRes
} from '@qommand/common/src/requests/windowManagerActions.request'

const createActiveWindowManager = () => {
    return {
        initialize: () => Promise.resolve(undefined),
        maximize: () => {
            console.log('WINDOWS', {windows: windowManager.getWindows()});
            windowManager.getActiveWindow().maximize();
        }
    }
}

export const activeWindowManager = createActiveWindowManager();
export type ActiveWindowManagerMethod = keyof typeof activeWindowManager;

responseHandler.handleResponse<WindowManagerActionsRequestReq, WindowManagerActionsRequestRes>(windowManagerActionsRequestName, () => true, () => ({
    actions: Object.keys(activeWindowManager) as ActiveWindowManagerMethod[]
}));
