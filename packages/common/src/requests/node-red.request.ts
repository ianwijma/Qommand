export const nodeRedRequestName = 'nodeRedRequest';

export type NodeRedRequestReq = {};

export type NodeRedRequestRes = {
    host: string;
    port: number;
    adminPath: string;
};