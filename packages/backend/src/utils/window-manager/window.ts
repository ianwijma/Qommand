import {xdotool} from "../../dependencies/xdotool";

export type WindowId = string;
export type WindowPosition = { x: number, y: number };
export type WindowSize = { width: number; height: number };
export type Window = {
    id: WindowId,
    name: string,
    processId: number,
    position: WindowPosition,
    size: WindowSize,
    active: boolean,
}

const getWindowId = (window: WindowId | Window): WindowId => {
    if (typeof window === 'object') {
        return window.id;
    }

    return window;
}

export const getWindow = async (id: WindowId, activeWindowId: WindowId = undefined): Promise<Window> => {
    const run = (name: string) => xdotool.run(name, id);

    const [name, processIdRaw, geometryRaw, activeWindowIdRaw] = await Promise.all([
        run('getwindowname'),
        run('getwindowpid'),
        run('getwindowgeometry'),
        activeWindowId ? activeWindowId : run('getactivewindow'),
    ]);

    const [_, positionRaw, sizeRaw] = geometryRaw.split('\n');
    const [__, position] = positionRaw.split(' ');
    const [___, size] = sizeRaw.split(':');

    const [xRaw, yRaw] = position.split(',');
    const [widthRaw, heightRaw] = size.split('x');

    activeWindowId = activeWindowIdRaw;
    const processId = parseInt(processIdRaw, 10);
    const x = parseInt(xRaw, 10);
    const y = parseInt(yRaw, 10);
    const width = parseInt(widthRaw, 10);
    const height = parseInt(heightRaw, 10);

    return {
        id,
        name,
        processId,
        position: {x, y},
        size: {width, height},
        active: id === activeWindowId,
    }
}

export const listWindows = async () => {
    const [searchResults, activeWindowId] = await Promise.all([
        xdotool.run('search', ''),
        xdotool.run('getactivewindow'),
    ])
    const windowIds = searchResults.split('\n');

    // Fetch all active window data
    const windowResults = await Promise.allSettled(
        windowIds.map(id => getWindow(id, activeWindowId))
    );

    // parse windows
    const windows: Window[] = [];
    windowResults.forEach((result) => {
        if (result.status === 'fulfilled') {
            windows.push(result.value);
        }
    });

    return windows;
}

const moveWindow = async (window: Window | WindowId, windowPosition: WindowPosition) => {
    const windowId = getWindowId(window);
    const {x, y} = windowPosition;

    await xdotool.run('windowmove', windowId, x, y);
}