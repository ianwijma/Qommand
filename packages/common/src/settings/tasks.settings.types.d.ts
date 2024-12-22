import {BaseSettings} from "../settings.types";

export type BaseTask = {
    id: string;
    name: string;
}

export type NoopTask = BaseTask & {
    type: 'noop';
}

export type CommandTask = BaseTask & {
    type: 'command';
    command: string;
}

export type Tasks = NoopTask | CommandTask

export type TasksSettings = BaseSettings & {
    tasks: Tasks[]
};