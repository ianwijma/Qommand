export const useWindowControls = () => {
    return {
        minimize: () => {
            console.log('Minimizing window');
            // @ts-ignore
            window?.windowApi?.minimize();
        },
        close: () => {
            console.log('close window');
            // @ts-ignore
            window?.windowApi?.close();
        },
    };
}