// @ts-ignore
type Window = {
    id: string
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

    return {
        initialize: async () => {
            // TODO: Check if xdotools is installed.

            isInstalled = true;
        },
        getWindows: async () => {
            isInitialized();

            return []
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
