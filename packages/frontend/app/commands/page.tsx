'use client';

import {DefaultWindowContainer} from "../../components/windowContainer/DefaultWindowContainer";
import {FunctionComponent, PropsWithChildren, useCallback, useMemo, useState} from "react";
import {useSettings} from "../../hooks/useSettings";
import {Folder, FolderId, FolderSettings} from "@qommand/common/src/settings/folders.settings.types";
import {CommandId, Commands, CommandSettings} from "@qommand/common/src/settings/commands.settings.types";
import {createDialog} from "../../utils/createDialog";
import {nanoid} from "nanoid";

const TableHeader = ({children, className}: PropsWithChildren & { className?: string }) => {

    return <th className={`text-left ${className}`}>{children}</th>
};

const TableCell = ({children, className}: PropsWithChildren & { className?: string }) => {
    return <td className={className}>{children}</td>
}

type TableRow = {
    id: string,
    CollapseEl: FunctionComponent,
    NameEl: FunctionComponent,
    TypeEl: FunctionComponent,
    AliasEl: FunctionComponent,
    HotkeyEl: FunctionComponent,
    ActionEl: FunctionComponent
}

export default function CommandsPage() {
    const [query, setQuery] = useState('');
    const [openState, setOpenState] = useState<Record<string, boolean>>({});
    const isOpenState = useCallback((key: string) => !!openState[key], [openState]);
    const updateOpenState = (key: string, open: boolean) => {
        setOpenState({
            ...openState,
            [key]: open
        })
    }

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

    const isLoading = isLoadingCommands || isLoadingFolder;

    const handleFolderUpdate = () => updateFolderSettings(folderSettings);
    const handleCommandUpdate = () => updateCommandsSettings(commandsSettings);

    const toggleFolder = (folderId: FolderId, collapsed: boolean) => {
        folderSettings.subFolders[folderId].collapsed = collapsed;

        handleFolderUpdate()
    }

    const toggleCommand = (commandId: CommandId, checked: boolean) => {
        commandsSettings.commands[commandId].enabled = checked;

        handleCommandUpdate();
    }

    const editFolder = async (folderId: FolderId) => {
        if (!isOpenState('edit-folder')) {
            updateOpenState('edit-folder', true);

            const {success, data} = await createDialog<{ input: string }>({
                type: 'input',
                message: 'Give folder name',
                title: 'Give folder name',
                value: folderSettings.subFolders[folderId].name
            });

            updateOpenState('edit-folder', false);

            if (success) {
                const {input} = data;
                const title = input.trim();

                if (title) {
                    folderSettings.subFolders[folderId].name = title;
                }

                handleFolderUpdate();
            }
        }
    }

    const editCommand = async (command: Commands) => {
        const {id: commandId, name} = command;

        await createDialog<{}>({
            type: 'edit-command',
            title: `Edit ${name}`,
            commandId
        });
    };

    const createCommand = async (folder: Folder) => {
        if (!isOpenState('create-command')) {
            updateOpenState('create-command', true);

            const {success, data} = await createDialog<{ name: string, type: 'shell' | 'script' }>({
                type: 'create-command',
            });

            updateOpenState('create-command', false);

            if (success) {
                const {name: input, type} = data;
                const name = input.trim();

                if (name) {
                    const newFolderId: FolderId = nanoid();
                    const newCommandId: CommandId = nanoid();

                    commandsSettings.commands[newCommandId] = {
                        id: newCommandId,
                        system: false,
                        icon: '',
                        name,
                        type: type,
                        aliases: [],
                        hotkey: '',
                        enabled: true,
                        commandConfig: {}
                    }

                    handleCommandUpdate();

                    folder.collapsed = false;
                    folder.subFolders[newFolderId] = {
                        id: newFolderId,
                        collapsed: false,
                        name,
                        subFolders: {},
                        targetId: newCommandId
                    }

                    handleFolderUpdate();
                }
            }
        }
    };

    const createCategory = async () => {
        if (!isOpenState('create-category')) {
            updateOpenState('create-category', true);

            const {success, data} = await createDialog<{ input: string }>({
                type: 'input',
                message: 'Give folder name',
                title: 'Give folder name',
            });

            updateOpenState('create-category', false);

            if (success) {
                const {input} = data;
                const title = input.trim();

                if (title) {
                    const newFolderId: FolderId = nanoid();

                    folderSettings.subFolders[newFolderId] = {
                        id: newFolderId,
                        collapsed: false,
                        name: input.trim(),
                        subFolders: {},
                        targetId: null
                    }

                    handleFolderUpdate();
                }
            }
        }
    }

    const tableRows = useMemo<TableRow[]>(() => {
        const rows: TableRow[] = [];

        if (isLoading) {
            return [];
        }

        const {subFolders: folders} = folderSettings;
        const {commands} = commandsSettings;
        const searchQuery = query.trim().toLowerCase();
        const isSearching = searchQuery.length > 0;

        for (const folderId in folders) {
            // Get current folder and it's data
            const folder = folders[folderId];
            const {name: folderName, subFolders, collapsed} = folder;
            const isCollapsed = isSearching ? false : collapsed;

            // Get the current folders commands
            const targetIds = Object.values(subFolders).map(({targetId}) => targetId);
            const targetCommands = targetIds.map((targetId) => commands[targetId]);
            const hasCommands = targetCommands.length > 0;

            // filter commands
            const filteredTargetCommands = targetCommands.filter(({name}) => name.toLowerCase().includes(searchQuery));
            const hasFilteredCommands = filteredTargetCommands.length > 0;

            // Filter folder
            let pushFolder = true;
            if (isSearching && !folderName.toLowerCase().includes(searchQuery) && !hasFilteredCommands) {
                pushFolder = false;
            }

            // Add the folder first
            if (pushFolder) {
                rows.push({
                    id: folderId,
                    CollapseEl: () => {
                        if (isSearching && hasCommands) {
                            return '⇐';
                        }

                        if (hasFilteredCommands) {
                            return <button onClick={() => toggleFolder(folderId, !isCollapsed)}>
                                {isCollapsed ? '⇓' : '⇐'}
                            </button>
                        }

                        return '';
                    },
                    NameEl: () => {
                        return (
                            <>
                                {hasCommands ? (collapsed ? '═' : '╔') : ''}
                                {' '}
                                <button
                                    onClick={() => editFolder(folderId)}
                                    className='underline'
                                >
                                    {folderName}
                                </button>
                            </>
                        )
                    },
                    TypeEl: () => 'Category',
                    AliasEl: () => '--',
                    HotkeyEl: () => '--',
                    ActionEl: () => <button onClick={() => createCommand(folder)}>+</button>
                })
            }

            if (!isCollapsed) {
                filteredTargetCommands.forEach((targetCommand, index) => {
                    const isLast = (Object.keys(filteredTargetCommands).length - 1) === index;

                    const {
                        id: commandId,
                        name: commandName,
                        type: commandType,
                        aliases,
                        hotkey,
                        enabled
                    } = targetCommand;

                    rows.push({
                        id: commandId,
                        CollapseEl: () => '',
                        NameEl: () => {

                            return (
                                <>
                                    {isLast ? '╚' : '╠'}
                                    {' '}
                                    <button
                                        onClick={() => editCommand(targetCommand)}
                                        className='underline'
                                    >
                                        {commandName}
                                    </button>
                                </>
                            )
                        },
                        TypeEl: () => commandType,
                        AliasEl: () => aliases.join(', '),
                        HotkeyEl: () => hotkey,
                        ActionEl: () => (
                            <input checked={enabled}
                                   onChange={({currentTarget: {checked}}) => toggleCommand(commandId, checked)}
                                   type='checkbox'/>
                        )
                    })
                });
            }
        }

        return rows;
    }, [folderSettings, commandsSettings, query, isLoading]);


    if (isLoading) {
        return <div>Loading...</div>;
    }

    return <DefaultWindowContainer title='Qommands'>
        <div className="flex gap-2 h-7">
            <input
                type='text'
                value={query}
                onChange={({currentTarget: {value}}) => setQuery(value)}
                placeholder='Search for Qommands'
                className='text-black w-full'
            />
            <button className='whitespace-nowrap' onClick={() => setQuery('')}>Clear Search</button>
            <button className='whitespace-nowrap' onClick={createCategory}>Add category</button>
        </div>

        <div className='overflow-y-auto'>
            <table className="w-full bg-slate-700">
                <thead className="sticky top-0 bg-slate-700">
                <tr>
                    <TableHeader className='w-5'></TableHeader>
                    <TableHeader>Name</TableHeader>
                    <TableHeader className='w-32'>Type</TableHeader>
                    <TableHeader className='w-32'>Aliases</TableHeader>
                    <TableHeader className='w-20'>Hotkey</TableHeader>
                    <TableHeader className='w-16'>Actions</TableHeader>
                </tr>
                </thead>
                <tbody>
                {tableRows.map(({id, CollapseEl, NameEl, TypeEl, AliasEl, HotkeyEl, ActionEl}) => {
                    return (
                        <tr key={id}>
                            <TableCell>
                                <CollapseEl/>
                            </TableCell>
                            <TableCell>
                                <NameEl/>
                            </TableCell>
                            <TableCell>
                                <TypeEl/>
                            </TableCell>
                            <TableCell>
                                <AliasEl/>
                            </TableCell>
                            <TableCell>
                                <HotkeyEl/>
                            </TableCell>
                            <TableCell>
                                <ActionEl/>
                            </TableCell>
                        </tr>
                    )
                })}
                <tr></tr>
                </tbody>
            </table>
        </div>
    </DefaultWindowContainer>
}