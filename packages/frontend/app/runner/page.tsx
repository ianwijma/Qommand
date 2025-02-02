'use client';

import {useSettings} from "../../hooks/useSettings";
import {CommandId, Commands, CommandSettings} from "@qommand/common/src/settings/commands.settings.types";
import {FolderSettings} from "@qommand/common/src/settings/folders.settings.types";
import {useEffect, useMemo, useRef, useState} from "react";
import {SearchSettings} from "@qommand/common/src/settings/search.settings.types";
import {runCommandEventName, RunCommandEventData} from "@qommand/common/src/events/runCommand.event";
import {eventHandler} from "../../utils/eventHandler";
import {useWindowControls} from "../../hooks/useWindowControls";

type Result = {
    id: CommandId;
    title: string;
    folder: string;
    weight: number;
    callback: () => void;
}

export default function AboutPage() {
    const {close} = useWindowControls();
    const inputRef = useRef<HTMLInputElement>(null);
    const selectedRef = useRef<HTMLLIElement>(null);
    const [query, setQuery] = useState('');
    const [selected, setSelected] = useState(0);
    const resetSelected = () => setSelected(0);

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
        const toResult = (command: Commands): Result => {
            const {id: commandId} = command;

            return {
                id: commandId,
                callback: () => {
                    eventHandler.emit<RunCommandEventData>(runCommandEventName, {commandId});

                    close();
                },
                title: commands[commandId].name,
                folder: '', // TODO: Fix Folders
                weight: searchWeights[commandId] ?? 0,
            }
        }
        const sortByWeights = (a: Result, b: Result) => b.weight - a.weight;

        let finalResults: Result[] = [];

        if (isSearching) {
            Object.keys(commands).forEach((commandId) => {
                let added = false;
                const command = commands[commandId];
                const {enabled, aliases, name} = command;

                if (!enabled) return;

                const commandResult = toResult(command);

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
                .map((commandId) => commands[commandId])
                .filter(({enabled}) => enabled)
                .map((command) => toResult(command))
                .sort(sortByWeights);
        }

        return finalResults;
    }, [commandsSettings, folderSettings, searchSettings, query]);

    useEffect(() => {
        resetSelected()
    }, [query]);

    const resultAmount = results.length;

    const increaseSelected = () => selected < resultAmount && setSelected(selected + 1);
    const decreaseSelected = () => selected !== 0 && setSelected(selected - 1);
    const confirmSelected = () => results[selected].callback();

    useEffect(() => {
        if (!inputRef.current) return;

        const inputEl = inputRef.current;

        inputEl.onblur = () => inputEl.focus();
        inputEl.onkeydown = ({code}) => {
            switch (code) {
                case 'ArrowDown':
                    increaseSelected();
                    break;
                case 'ArrowUp':
                    decreaseSelected();
                    break;
                case 'Enter':
                    confirmSelected();
                    break;
                case 'Escape':
                    close();
                    break;
            }
        }
    }, [inputRef, increaseSelected, decreaseSelected, confirmSelected]);

    useEffect(() => {
        if (!inputRef.current) return;

        const selectedEl = selectedRef.current;

        if (!selectedEl) return;

        selectedEl.scrollIntoView({behavior: 'smooth', block: 'nearest'});
    }, [selectedRef, selected]);

    // TODO: Make only the container and sub-items interactible: https://stackoverflow.com/a/78050093
    return <div className="flex flex-col items-center justify-center">
        <div className="w-screen h-20 p-3 bg-slate-700 rounded-3xl draggable">
            <input
                ref={inputRef}
                className='w-full h-full rounded-2xl text-black text-2xl px-2 not-draggable' autoFocus value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
        </div>
        <div className="w-11/12 p-3 bg-slate-700 rounded-b-3xl max-h-[800px] overflow-x-hidden">
            <ul className="flex flex-col gap-1">
                {results.map(({title, id, callback}: Result, index) => {
                    let roundTop = true;
                    let roundBottom = true;
                    if (resultAmount > 1) {
                        roundTop = false;
                        roundBottom = false;
                        if (index === 0) {
                            roundTop = true;
                        } else if (index + 1 === resultAmount) {
                            roundBottom = true;
                        }
                    }

                    const isSelected = index === selected;

                    return (
                        <li key={id} ref={isSelected ? selectedRef : null}>
                            <button
                                onClick={() => callback()}
                                className={`w-full text-black flex items-center text-xl h-10 px-2 hover:bg-slate-400 ${roundTop ? 'rounded-t-2xl' : ''} ${roundBottom ? 'rounded-b-2xl' : ''} ${isSelected ? 'bg-slate-300' : 'bg-white'}`}>
                                {title}
                            </button>
                        </li>
                    )
                })}
            </ul>
        </div>
    </div>
}