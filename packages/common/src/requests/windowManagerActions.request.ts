import type {ActiveWindowManagerMethod} from "qommand/src/utils/activeWindowManager";

export const windowManagerActionsRequestName = 'windowManagerActionsRequest';

export type WindowManagerActionsRequestReq = {};

export type WindowManagerActionsRequestRes = { actions: ActiveWindowManagerMethod[] };