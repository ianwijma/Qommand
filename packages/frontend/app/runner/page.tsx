'use client';

import {useSettings} from "../../hooks/useSettings";
import {CommandId, CommandSettings} from "@qommand/common/src/settings/commands.settings.types";
import {FolderSettings} from "@qommand/common/src/settings/folders.settings.types";
import {useMemo, useState} from "react";
import {SearchSettings} from "@qommand/common/src/settings/search.settings.types";

type Result = {
    id: CommandId;
    title: string;
    folder: string;
    weight: number;
    callback: () => void;
}

export default function AboutPage() {
    const [query, setQuery] = useState('');

    const {
        isLoading: isLoadingCommands,
        settings: commandsSettings,
        updateSettings: updateCommandsSettings
    } = useSettings<CommandSettings>('commands');
    const {
        isLoading: isLoadingFolder,
        settings: folderSettings,
        updateSettings: updateFolderSettings
    } = useSettings<FolderSettings>('folder-commands');
    const {
        isLoading: isLoadingSearch,
        settings: searchSettings,
        updateSettings: updateSearchSettings
    } = useSettings<SearchSettings>('search');

    const isLoading = isLoadingCommands || isLoadingFolder || isLoadingSearch;

    const results = useMemo<Result[]>(() => {
        if (isLoading) return [];

        const aliasResults: Result[] = [];
        const nameResults: Result[] = [];

        const {subFolders} = folderSettings;
        const {commands} = commandsSettings;
        const {searchWeights} = searchSettings;
        const isSearching = query.trim() !== '';
        const searchQuery = query.toLowerCase();
        const matches = (input: string) => input.toLowerCase().includes(searchQuery);
        const toResult = (commandId: CommandId): Result => ({
            id: commandId,
            callback: () => undefined,
            title: commands[commandId].name,
            folder: '', // TODO: Fix FOlders
            weight: searchWeights[commandId],
        })
        const sortByWeights = (a: Result, b: Result) => a.weight - a.weight;

        let finalResults: Result[] = [];

        if (isSearching) {
            Object.keys(commands).forEach((commandId) => {
                let added = false;
                const command = commands[commandId];
                const {enabled, aliases, name} = command;

                if (!enabled) return;

                const commandResult = toResult(commandId);

                aliases.forEach((alias) => {
                    if (!added && matches(alias)) {
                        added = true;
                        aliasResults.push(commandResult)
                    }
                });

                if (!added && matches(name)) {
                    aliasResults.push(commandResult)
                }
            })

            finalResults = [
                ...aliasResults.sort(sortByWeights),
                ...nameResults.sort(sortByWeights),
            ]
        } else {
            finalResults = Object
                .keys(commands)
                .map((commandId) => toResult(commandId))
                .sort(sortByWeights);
        }

        return finalResults;
    }, [commandsSettings, folderSettings, searchSettings, query]);

    // TODO: Make only the container and sub-items interactible: https://stackoverflow.com/a/78050093
    return <div className="flex flex-col items-center justify-center">
        <div className="w-screen h-24 p-3 bg-slate-700 rounded-3xl draggable">
            <input
                className='w-full h-full rounded-2xl text-black text-2xl px-2 not-draggable' autoFocus value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
        </div>
        <div className="w-11/12 p-3 bg-slate-700 rounded-b-3xl">
            <ul className="flex flex-col gap-1">
                {/* TODO: Fix the li borders. */}
                {results.map(({title, id, callback}: Result, index) => (
                    <li key={id} className='bg-white text-black flex items-center rounded-2xl text-xl h-10 px-2'>
                        <span>
                            {title}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    </div>
}