import {BaseSettings} from "../settings.types";
import {SimpleEventBusData} from "../eventbus.types";

export type CommandId = string;

export type BaseCommand = {
    id: CommandId;
    icon: string;
    name: string;
    type: string;
    aliases: string[];
    hotkey: string;
    enabled: boolean;
    commandConfig: SimpleEventBusData
}

export type ShellCommand = BaseCommand & {
    type: 'shell';
    commandConfig: {
        code?: string
    };
}

export type ScriptCommand = BaseCommand & {
    type: 'script';
    commandConfig: {
        path?: string
    };
}

export type Commands = ShellCommand | ScriptCommand;

export type CommandSettings = BaseSettings & {
    commands: { [key: CommandId]: Commands }
};