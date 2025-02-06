import {eventHandler} from "./eventHandler";
import {RunCommandEventData, runCommandEventName} from '@qommand/common/src/events/runCommand.event'
import {commandsSettings} from "../settings/commands.setting";
import {searchSettings} from "../settings/search.setting";
import {Commands} from "@qommand/common/src/settings/commands.settings.types";
import {runShell} from "../run-shell";
import {runFile} from "../run-file";
import {activeWindowManager} from "./activeWindowManager";

const DAYS_AGO_UNIX = 30 * 24 * 3600;

const createCommandRunner = () => {
    const updateSearch = async (command: Commands) => {
        const {id} = command;

        const {searchHistory, searchWeights, ...rest} = searchSettings.getSettings();

        const now = Date.now();

        // Update the search history
        searchHistory[id] ??= [];
        searchHistory[id].push(now);
        searchHistory[id] = searchHistory[id].filter((item) => item > now - DAYS_AGO_UNIX);

        // Update the search weight
        searchWeights[id] = searchHistory[id].length;

        // Save the settings
        await searchSettings.updateSettings({
            searchHistory,
            searchWeights,
            ...rest
        })
    }

    const runCommand = async (command: Commands) => {
        const {type} = command;

        let out: string = '';

        switch (type) {
            case "script":
                out = await runFile({
                    filePath: command.commandConfig.path
                });
                break;
            case "shell":
                out = await runShell({
                    code: command.commandConfig.code
                });
                break;
            case 'window-management':
                const {commandConfig: {method}} = command;
                await activeWindowManager[method]();
        }

        console.log('Command ran', {out})
    }

    return {
        initialize: async () => {
            console.log("Initializing Command Runner");

            eventHandler.listen<RunCommandEventData>(runCommandEventName, async ({commandId}) => {
                const {commands} = commandsSettings.getSettings();

                if (commandId in commands) {
                    const command = commands[commandId];

                    console.log('Running command', {command});

                    await Promise.all([
                        // Run the command
                        runCommand(command),
                        // Update the search settings
                        updateSearch(command),
                    ])
                } else {
                    console.error("Command not found", {commandId});
                }
            });
        }
    }
}

export const commandRunner = createCommandRunner();