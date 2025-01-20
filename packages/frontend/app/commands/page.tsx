'use client';

import {DefaultWindowContainer} from "../../components/windowContainer/DefaultWindowContainer";
import {FunctionComponent, PropsWithChildren, useMemo, useState} from "react";
import {useSettings} from "../../hooks/useSettings";
import {FolderId, FolderSettings, SubFolders} from "@qommand/common/src/settings/folders.settings.types";
import {CommandId, CommandSettings} from "@qommand/common/src/settings/commands.settings.types";
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
    CollapseElement: FunctionComponent,
    name: string,
    type: string,
    alias: string,
    hotkey: string,
    ActionElement: FunctionComponent
}

export default function CommandsPage() {
    const [query, setQuery] = useState('');
    const [creating, setCreating] = useState(false);

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

    const handleFolderUpdate = () => updateFolderSettings(folderSettings);
    const handleCommandUpdate = () => updateCommandsSettings(commandsSettings);

    const isLoading = isLoadingCommands || isLoadingFolder;

    const initialTableRows = useMemo<TableRow[]>(() => {
        // TODO: Create table rows from folder & command settings.
        // TODO: Use the same logic as below

        return [];
    }, [folderSettings, commandsSettings])

    const filteredTableRows = useMemo<TableRow[]>(() => {
        // TODO: Filter out table rows

        return [];
    }, [initialTableRows, query]);


    if (isLoading) {
        return <div>Loading...</div>;
    }

    const {subFolders} = folderSettings;
    const {commands} = commandsSettings;

    const createCategory = async () => {
        if (!creating) {
            setCreating(true);
            const {success, data} = await createDialog<{ input: string }>({
                type: 'input',
                message: 'Give folder name',
                title: 'Give folder name',
            });

            setCreating(false);

            if (success) {
                const {input} = data;
                const title = input.trim();

                if (title) {
                    const newFolderId: FolderId = nanoid();

                    subFolders[newFolderId] = {
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

    const createCommand = async (subSubFolders: SubFolders) => {
        if (creating) {
            setCreating(true);
            const {success, data} = await createDialog<{ name: string, type: 'shell' | 'script' }>({
                type: 'create-command',
            });

            setCreating(false);

            if (success) {
                const {name: input, type} = data;
                const name = input.trim();

                if (name) {
                    const newFolderId: FolderId = nanoid();
                    const newCommandId: CommandId = nanoid();

                    commandsSettings.commands[newCommandId] = {
                        id: newCommandId,
                        icon: '',
                        name,
                        type: type,
                        aliases: [],
                        hotkey: '',
                        enabled: true,
                        commandConfig: {}
                    }

                    handleCommandUpdate();

                    subSubFolders[newFolderId] = {
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

    const toggleFolder = (folderId: FolderId, collapsed: boolean) => {
        subFolders[folderId].collapsed = collapsed;

        handleFolderUpdate()
    }

    const toggleCommand = (commandId: CommandId, checked: boolean) => {
        commands[commandId].enabled = checked;

        handleCommandUpdate();
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
            <button className='whitespace-nowrap' onClick={createCategory}>Add category</button>
        </div>

        <div className="">
            <table className="w-full">
                <thead>
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
                {filteredTableRows.map(({id, CollapseElement, name, type, alias, hotkey, ActionElement}) => (
                    <tr key={id}>
                        <TableCell>
                            <CollapseElement/>
                        </TableCell>
                        <TableCell>{name}</TableCell>
                        <TableCell>{type}</TableCell>
                        <TableCell>{alias}</TableCell>
                        <TableCell>{hotkey}</TableCell>
                        <TableCell>
                            <ActionElement/>
                        </TableCell>
                    </tr>
                ))}
                {Object.values(subFolders).map(({
                                                    id: folderId,
                                                    name: folderName,
                                                    subFolders: subSubFolders,
                                                    collapsed
                                                }) => (
                    <>
                        <tr key={folderId}>
                            <TableCell>
                                <button onClick={() => toggleFolder(folderId, !collapsed)}>
                                    {collapsed ? '+' : '-'}
                                </button>
                            </TableCell>
                            <TableCell>{folderName}</TableCell>
                            <TableCell>Category</TableCell>
                            <TableCell>--</TableCell>
                            <TableCell>--</TableCell>
                            <TableCell>
                                <button onClick={() => createCommand(subSubFolders)}>+</button>
                            </TableCell>
                        </tr>
                        {!collapsed ? Object.values(subSubFolders).map(({targetId}, index) => {
                            const {id: commandId, name: commandName, type, aliases, hotkey} = commands[targetId];
                            const isLast = (Object.keys(subSubFolders).length - 1) === index;

                            let {enabled} = commands[targetId];

                            return (
                                <tr key={commandId}>
                                    <TableCell></TableCell>
                                    <TableCell>
                                        {isLast ? '└' : '├'}
                                        {' '}
                                        {commandName}
                                    </TableCell>
                                    <TableCell>{type}</TableCell>
                                    <TableCell>{aliases.join(', ')}</TableCell>
                                    <TableCell>{hotkey}</TableCell>
                                    <TableCell>
                                        <input checked={enabled}
                                               onChange={({currentTarget: {checked}}) => toggleCommand(commandId, checked)}
                                               type='checkbox'/>
                                    </TableCell>
                                </tr>
                            )
                        }) : ''}
                    </>
                ))}
                <tr></tr>
                </tbody>
            </table>
        </div>
    </DefaultWindowContainer>
}