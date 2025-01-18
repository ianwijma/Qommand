export const runJavascriptRequestName = 'runJavascriptRequest';

export type RunJavascriptRequestReq = {
    code: string;
    codeInput?: Record<string, string | number | boolean>;
    allowRead?: boolean;
    allowWrite?: boolean;
    allowNetwork?: boolean;
    allowEnvironment?: boolean;
    allowSystem?: boolean;
    allowRun?: boolean;
    timeout?: number;
};

export type RunJavascriptRequestRes = any;