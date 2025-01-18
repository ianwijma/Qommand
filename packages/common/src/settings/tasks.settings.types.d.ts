import {BaseSettings} from "../settings.types";

export type TaskId = string;
export type TaskName = string;

export type BaseTask = {
    id: TaskId;
    name: TaskName;
}

export type NoopTask = BaseTask & {
    type: 'noop';
}

export type ShellScriptTask = BaseTask & {
    type: 'shell';
    code: string;
    expectedExitCode: number | null;
    timeout: number;
}

export type JavascriptTask = BaseTask & {
    type: 'javascript';
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

export type Tasks = NoopTask | ShellScriptTask | JavascriptTask

export type TasksSettings = BaseSettings & {
    tasks: { [key: TaskId]: Tasks }
};