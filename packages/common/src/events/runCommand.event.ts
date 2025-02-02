import {CommandId} from "../settings/commands.settings.types";

export const runCommandEventName = 'runCommand';

export type RunCommandEventData = {
    commandId: CommandId
};