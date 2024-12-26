export type CreateWindowParams = {
    title: string,
}

export type CreateWindowReturn = {
    initialize: () => Promise<void>;
    open: () => Promise<void>;
    close: () => Promise<void>;
    minimize: () => Promise<void>;
    openDevTools: () => Promise<void>;
    closeDevTools: () => Promise<void>;
};

export const createDialog = () => {

}