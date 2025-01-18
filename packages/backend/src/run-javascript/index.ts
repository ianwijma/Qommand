import {Isolate} from "isolated-vm";
import {fileSystem} from "./fileSystem";
import {network} from "./network";
import {environment} from "./environment";
import {system} from "./system";
import {run} from "./run";
import {responseHandler} from "../utils/responseHandler";
import {
    runJavascriptRequestName,
    type RunJavascriptRequestReq,
    type RunJavascriptRequestRes
} from '@qommand/common/src/requests/runJavascript.request'

const isolatedVM = require('isolated-vm');

export type RunJavascript = {
    code: string;
    codeInput?: Record<string, string | number | boolean>;
    timeout?: number;
    allowRead?: boolean;
    allowWrite?: boolean;
    allowNetwork?: boolean;
    allowEnvironment?: boolean;
    allowSystem?: boolean;
    allowRun?: boolean;
}

// Create new Isolate with memory limit
const isolate: Isolate = new isolatedVM.Isolate({memoryLimit: 128});

export const runJavascript = async ({
                                        code,
                                        codeInput = {},
                                        allowRead = false,
                                        allowWrite = false,
                                        allowNetwork = false,
                                        allowEnvironment = false,
                                        allowSystem = false,
                                        allowRun = false,
                                        timeout = 1000
                                    }: RunJavascript): Promise<any> => {
    // Create a new isolated context for code execution
    const context = await isolate.createContext();

    // What to return from the script
    let response: any = undefined;

    // Setup code specific permissions
    const reference = context.global;
    await Promise.all([
        reference.set('external', {
            set: (value: any) => {
                response = value
            },
            get: (key: any) => {
                return codeInput[key] ?? undefined;
            }
        }),
        reference.set('log', (...args: any[]) => console.log(...args)),
        reference.set('fileSystem', fileSystem({allowRead, allowWrite})),
        reference.set('network', network({allowNetwork})),
        reference.set('environment', environment({allowEnvironment})),
        reference.set('system', system({allowSystem})),
        reference.set('run', run({allowRun})),
    ])

    // execute the code
    await context.eval(code, {timeout});

    // force cleanup of the ran code.
    context.release();

    return response;
}

responseHandler.handleResponse<RunJavascriptRequestReq, RunJavascriptRequestRes>(runJavascriptRequestName, () => {
    console.log('About to run JS');

    return true;
}, (request) => {
    console.log('Running Javascript', request);
    return runJavascript(request);
});