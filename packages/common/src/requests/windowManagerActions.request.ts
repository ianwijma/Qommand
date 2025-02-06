import type {WindowManagerMethods} from "qommand/src/utils/windowManager";

export const windowManagerActionsRequestName = 'windowManagerActionsRequest';

export type WindowManagerActionsRequestReq = {};

export type WindowManagerActionsRequestRes = { actions: WindowManagerMethods[] };