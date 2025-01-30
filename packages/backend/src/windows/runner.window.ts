import {createWindow} from "./createWindow";

export const runnerWindow = createWindow({
    title: 'Runner',
    route: 'runner',
    width: 1080,
    height: 360,
    minWidth: 1080,
    minHeight: 360,
    resizable: false,
    alwaysOnTop: true,
    movable: false,
    posY: 150,
});
