'use client';

import {useSettings} from "../../hooks/useSettings";
import {useEffect, useMemo, useRef, useState} from "react";
import {useWindowControls} from "../../hooks/useWindowControls";
import {
    BaseClipboardHistoryItemHashId, BaseClipboardHistoryItemTypes,
    ClipboardHistorySettings
} from "@qommand/common/src/settings/clipboard-history.settings.types";
import {eventHandler} from "../../utils/eventHandler";
import {
    RestoreClipboardHistoryEventData,
    restoreClipboardHistoryEventName
} from '@qommand/common/src/events/restoreClipboardHistory.event'

type SearchableClipboardHistoryItems = {
    id: BaseClipboardHistoryItemHashId;
    type: BaseClipboardHistoryItemTypes;
    title: string;
    searchableText: string;
}

type Result = {
    id: BaseClipboardHistoryItemHashId;
    type: BaseClipboardHistoryItemTypes;
    title: string;
    callback: () => void;
}

export default function AboutPage() {
    const {close} = useWindowControls();
    const inputRef = useRef<HTMLInputElement>(null);
    const selectedRef = useRef<HTMLLIElement>(null);
    const [query, setQuery] = useState('');
    const [selected, setSelected] = useState(0);
    const resetSelected = () => setSelected(0);

    const {isLoading, settings} = useSettings<ClipboardHistorySettings>('clipboard');

    const searchableClipboardHistory = useMemo<SearchableClipboardHistoryItems[]>(() => {
        if (isLoading) return [];

        const {clipboardHistory} = settings;

        return clipboardHistory.map((item) => {
            const {id, type} = item;
            switch (type) {
                case 'text':
                case 'html': {
                    const {text} = item;
                    return {
                        id,
                        type,
                        title: text,
                        searchableText: text.toLowerCase(),
                    }
                }
                case 'image': {
                    const {image} = item;
                    console.log('image', {image})
                    return {
                        id,
                        type,
                        title: image,
                        searchableText: 'image'
                    }
                }
            }
        })
    }, [settings]);

    const results = useMemo<Result[]>(() => {
        const toResult = ({id, type, title}) => ({
            id, type, title, callback: () => {
                eventHandler.emit<RestoreClipboardHistoryEventData>(restoreClipboardHistoryEventName, {clipboardHistoryItemHashId: id});

                close();
            }
        });

        const isSearching = query.trim() !== '';
        if (isSearching) {
            const searchQuery = query.toLowerCase();
            const matches = ({searchableText}: SearchableClipboardHistoryItems) => searchableText.includes(searchQuery);
            return searchableClipboardHistory
                .filter(matches)
                .map(toResult)
        }

        return searchableClipboardHistory.map(toResult);
    }, [searchableClipboardHistory, query]);

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
                {results.map(({title, id, type, callback}: Result, index) => {
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
                                className={`w-full text-black flex items-center text-xl h-10 px-2 truncate hover:bg-slate-400 ${roundTop ? 'rounded-t-2xl' : ''} ${roundBottom ? 'rounded-b-2xl' : ''} ${isSelected ? 'bg-slate-300' : 'bg-white'}`}>
                                {type === 'image' ? <img src={title} alt='image'/> : title}
                            </button>
                        </li>
                    )
                })}
            </ul>
        </div>
    </div>
}