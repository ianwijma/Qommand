import {createWindow} from "./createWindow";
import {isDev} from "../utils/isDev";

export const runnerWindow = createWindow({
    title: 'Runner',
    route: 'runner',
    width: 1080,
    height: 900,
    minWidth: 1080,
    minHeight: 900,
    resizable: false,
    alwaysOnTop: true,
    movable: false,
    posY: 150,
    hasShadow: false,
    transparent: true,
    onBlur: ({close}) => isDev() || close(),
});
