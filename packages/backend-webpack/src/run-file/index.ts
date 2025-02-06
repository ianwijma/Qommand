import {exec} from "child_process";

export type RunFile = {
    filePath: string;
    expectedExitCode?: number | null;
    timeout?: number;
}

export const runFile = async ({filePath, expectedExitCode = null, timeout = 1000}: RunFile): Promise<any> => {
    return new Promise((resolve, reject) => {
        const process = exec(filePath);
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