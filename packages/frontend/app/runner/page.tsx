'use client';

import {useSettings} from "../../hooks/useSettings";
import {CommandSettings} from "@qommand/common/src/settings/commands.settings.types";
import {FolderSettings} from "@qommand/common/src/settings/folders.settings.types";
import {useMemo, useState} from "react";
import {SearchSettings} from "@qommand/common/src/settings/search.settings.types";

type Result = {
    title: string;
    folder: string;
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
        const {subFolders} = folderSettings;
        const {commands} = commandsSettings;
        const {searchWeights} = searchSettings;

        return [];
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
                <li className='bg-white text-black flex items-center rounded-t-2xl text-xl h-10 px-2'>First</li>
                <li className='bg-white text-black flex items-center text-xl h-10 px-2'>Second</li>
                <li className='bg-white text-black flex items-center rounded-b-2xl text-xl h-10 px-2'>Third</li>
            </ul>
        </div>
    </div>
}