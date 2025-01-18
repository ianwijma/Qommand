import {exec} from "child_process";
import {responseHandler} from "../utils/responseHandler";
import {
    runShellRequestName,
    type RunShellRequestReq,
    type RunShellRequestRes
} from '@qommand/common/src/requests/runShell.request'


export type RunShell = {
    code: string;
    expectedExitCode?: number | null;
    timeout?: number;
}

export const runShell = async ({code, expectedExitCode = null, timeout = 1000}: RunShell): Promise<any> => {
    return new Promise((resolve, reject) => {
        const process = exec(`
        cd ~;
        
        execute() {
          ${code}
        }
        
        execute;
        `);
        const {stdout, stderr, kill} = process;

        let running = true;
        let response: string = '';
        let error = '';

        stdout.on("data", (data: string) => response += data);
        stdout.on("stderr", (data: string) => error += data);

        stderr.on("close", (exitCode: number) => {
            running = false;
            if (expectedExitCode !== null && exitCode !== expectedExitCode) {
                reject(error);
            } else {
                resolve(response);
            }
        });

        setTimeout(() => {
            if (running) {
                kill();

                reject('timed out');
            }
        }, timeout);
    });
}

responseHandler.handleResponse<RunShellRequestReq, RunShellRequestRes>(runShellRequestName, () => true, (request) => {
    return runShell(request);
});