'use client';

import {useSettings} from "../../hooks/useSettings";
import {CommandId, CommandSettings} from "@qommand/common/src/settings/commands.settings.types";
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
        const toResult = (commandId: CommandId): Result => ({
            id: commandId,
            callback: () => {
                eventHandler.emit<RunCommandEventData>(runCommandEventName, {commandId});

                close();
            },
            title: commands[commandId].name,
            folder: '', // TODO: Fix Folders
            weight: searchWeights[commandId] ?? 0,
        })
        const sortByWeights = (a: Result, b: Result) => b.weight - a.weight;

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

    console.log('results', {results})

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
                    let roundedClass = 'rounded-2xl';
                    if (resultAmount > 1) {
                        roundedClass = '';
                        if (index === 0) {
                            roundedClass = 'rounded-t-2xl';
                        } else if (index + 1 === resultAmount) {
                            roundedClass = 'rounded-b-2xl';
                        }
                    }

                    const isSelected = index === selected;
                    let backgroundColour = '';
                    if (isSelected) {
                        backgroundColour = 'bg-slate-300'
                    }

                    return (
                        <li key={id} ref={isSelected ? selectedRef : null}>
                            <button
                                onClick={() => callback()}
                                className={`bg-white w-full text-black flex items-center text-xl h-10 px-2  ${roundedClass} ${backgroundColour}`}>
                                {title}
                            </button>
                        </li>
                    )
                })}
            </ul>
        </div>
    </div>
}