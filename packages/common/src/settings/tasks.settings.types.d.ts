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
    type: 'shell-script';
    script: string;
}

export type Tasks = NoopTask | ShellScriptTask

export type TasksSettings = BaseSettings & {
    tasks: { [key: TaskId]: Tasks }
};