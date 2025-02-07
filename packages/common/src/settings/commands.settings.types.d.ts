import {BaseSettings} from "../settings.types";
import {SimpleEventBusData} from "../eventbus.types";
import {WindowManagerMethods} from "qommand/src/utils/windowManager";

export type CommandId = string;

export type BaseCommand = {
    id: CommandId;
    system: boolean;
    icon: string;
    name: string;
    type: string;
    aliases: string[];
    hotkey: string;
    enabled: boolean;
    commandConfig: SimpleEventBusData
}

export type NodeRedCommand = BaseCommand & {
    type: 'node-red';
    commandConfig: {};
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

export type WindowManagementCommand = BaseCommand & {
    type: 'window-management';
    system: true;
    commandConfig: {
        method: WindowManagerMethods
    };
}

export type Commands = ShellCommand | ScriptCommand | NodeRedCommand | WindowManagementCommand;

export type CommandSettings = BaseSettings & {
    commands: { [key: CommandId]: Commands }
};