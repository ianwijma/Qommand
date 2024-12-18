export type WindowControls = {
    initialize: () => Promise<void>;
    open: () => Promise<void>;
    close: () => Promise<void>;
    minimize: () => Promise<void>;
    openDevTools: () => Promise<void>;
}