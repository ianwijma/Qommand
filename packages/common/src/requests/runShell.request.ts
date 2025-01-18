export const runShellRequestName = 'runShellRequest';

export type RunShellRequestReq = {
    code: string;
    timeout?: number;
};

export type RunShellRequestRes = any;