'use client';

import {useSettings} from "../../hooks/useSettings";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {useWindowControls} from "../../hooks/useWindowControls";
import {
    ClipboardHistoryItemHashId,
    ClipboardHistoryItemTypes,
    ClipboardHistorySettings
} from "@qommand/common/src/settings/clipboard-history.settings.types";
import {eventHandler} from "../../utils/eventHandler";
import {
    RestoreClipboardHistoryEventData,
    restoreClipboardHistoryEventName
} from '@qommand/common/src/events/restoreClipboardHistory.event'
import {
    ClearClipboardHistoryEventData,
    clearClipboardHistoryEventName
} from '@qommand/common/src/events/clearClipboardHistory.event'

type SearchableClipboardHistoryItems = {
    id: ClipboardHistoryItemHashId;
    type: ClipboardHistoryItemTypes;
    title: string;
    searchableText: string;
}

type Result = {
    id: ClipboardHistoryItemHashId;
    type: ClipboardHistoryItemTypes;
    title: string;
}

export default function AboutPage() {
    const {close} = useWindowControls();
    const inputRef = useRef<HTMLInputElement>(null);
    const selectedRef = useRef<HTMLLIElement>(null);
    const [query, setQuery] = useState('');
    const [selected, setSelected] = useState(0);
    const resetSelected = () => setSelected(0);

    const {isLoading, settings} = useSettings<ClipboardHistorySettings>('clipboard');

    const restoreClipboardItem = useCallback((id: ClipboardHistoryItemHashId) => {
        eventHandler.emit<RestoreClipboardHistoryEventData>(restoreClipboardHistoryEventName, {clipboardHistoryItemHashId: id});

        close();
    }, [settings]);

    const removeClipboardItem = useCallback((id: ClipboardHistoryItemHashId) => {
        eventHandler.emit<ClearClipboardHistoryEventData>(clearClipboardHistoryEventName, {ids: [id]});
    }, [settings]);

    const removeAllClipboardItems = useCallback(async () => {
        const {clipboardHistory} = settings;

        eventHandler.emit<ClearClipboardHistoryEventData>(clearClipboardHistoryEventName, {
            ids: clipboardHistory.map(({id}) => id),
        });

        close();
    }, [settings]);

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
        const toResult = ({id, type, title}) => ({id, type, title});

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

    const totalAmount = searchableClipboardHistory.length;
    const resultAmount = results.length;
    const increaseSelected = useCallback(() => selected < (resultAmount - 1) && setSelected(selected + 1), [selected, resultAmount, setSelected]);
    const decreaseSelected = useCallback(() => selected !== 0 && setSelected(selected - 1), [selected, setSelected]);
    const confirmSelected = useCallback(() => restoreClipboardItem(results[selected].id), [results, selected, restoreClipboardItem]);

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

        selectedEl.scrollIntoView({block: 'nearest'});
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
                {results.map(({title, id, type}: Result, index) => {
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
                            <div
                                className={`w-full h-10 text-black flex text-xl hover:bg-slate-400 overflow-hidden ${roundTop ? 'rounded-t-2xl' : ''} ${roundBottom ? 'rounded-b-2xl' : ''} ${isSelected ? 'bg-slate-300' : 'bg-white'}`}>
                                <button
                                    className='w-full h-10 flex items-center px-2 truncate'
                                    onClick={() => restoreClipboardItem(id)}
                                >
                                    {type === 'image' ? <img src={title} alt='image'/> : title}
                                </button>
                                <button
                                    className='h-10 w-10 hover:bg-slate-500'
                                    onClick={() => removeClipboardItem(id)}
                                >
                                    X
                                </button>
                            </div>
                        </li>
                    )
                })}
                {totalAmount > 0 ? (
                    <li className='w-full h-10 text-black flex text-xl bg-red-300 hover:bg-red-400 rounded-2xl'>
                        <button className='w-full h-10 flex items-center px-2'
                                onClick={() => removeAllClipboardItems()}>
                            Clear history
                        </button>
                    </li>
                ) : (
                    <li className='w-full h-10 text-gray-500 text-xl bg-white flex items-center px-2 rounded-2xl'>
                        Nothing in your clipboard history yet.
                    </li>
                )}
            </ul>
        </div>
    </div>
}