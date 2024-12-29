export const useWindowControls = () => {
    return {
        minimize: () => {
            // @ts-ignore
            window?.windowApi?.minimize();
        },
        close: () => {
            // @ts-ignore
            window?.windowApi?.close();
        },
    };
}