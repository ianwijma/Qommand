// @ts-ignore
import {xdotool} from "../dependencies/xdotool";

type Window = {
    id: string
    name: string,
    processId: number,
    position: { x: number, y: number },
    size: { width: number; height: number },
}

export type WindowClient = {
    initialize: () => Promise<void>;
    getWindows: () => Promise<Window[]>;
}

const createLinuxWindowClient = (): WindowClient => {
    let isInstalled: boolean = false;

    const isInitialized = () => {
        if (!isInstalled) throw new Error("X11 client was not initialized");
    }

    const getWindow = async (windowId: string) => {
        const run = (name: string) => xdotool.run(name, windowId);
        const [nameRaw, pidRaw, geometryRaw] = await Promise.all([
            run('getwindowname'),
            run('getwindowpid'),
            run('getwindowgeometry'),
        ]);

        const [_, positionRaw, sizeRaw] = geometryRaw.split('\n');
        const [__, position] = positionRaw.trim().split(' ');
        const [___, size] = sizeRaw.trim().split(':');

        const [x, y] = position.trim().split(',');
        const [width, height] = size.trim().split('x');


        return {
            id: windowId,
            name: nameRaw,
            processId: pidRaw,
            position: {x, y},
            size: {width, height},
        }
    }

    return {
        initialize: async () => {
            isInstalled = await xdotool.isInstalled();
        },
        getWindows: async () => {
            isInitialized();

            const out = await xdotool.run("search", '');
            const windowIds = out.split('\n');

            const windowsResults = await Promise.allSettled(windowIds.map(getWindow));
            const windows: Window[] = windowsResults
                .filter(({status}) => status === 'fulfilled')
                // @ts-expect-error = Value is available as we're filtering of the fulfilled stated before...
                .map(({value}) => value)
                .filter(({name}) => !!name);

            return windows
        }
    }
}

let windowClient: WindowClient;

if (process.platform === 'linux') {
    windowClient = createLinuxWindowClient();
} else if (process.platform === 'win32') {
    throw new Error('Windows window client is not implemented yet');
} else if (process.platform === 'darwin') {
    throw new Error('MacOS window client is not implemented yet');
} else {
    throw new Error(`${process.platform} window client is not implemented yet`);
}

export {windowClient}
