'use client'

import {useSettings} from "../../../hooks/useSettings";
import {Commands, CommandSettings} from "@qommand/common/src/settings/commands.settings.types";
import {recursiveMerge} from "@qommand/common/src/object";
import {useSearchParams} from "next/navigation";
import {getPathForFile} from "../../../utils/files";
import {useButtonClick} from "../../../hooks/useButtonClick";

export const PageContent = () => {
    const {emitButtonClick} = useButtonClick();

    const searchParams = useSearchParams();
    const commandId = searchParams.get('commandId');

    const {isLoading, settings, updateSettings} = useSettings<CommandSettings>('commands');
    const handleUpdate = () => updateSettings(settings);

    const {commands = {}} = settings ?? {};
    const command = commands[commandId];
    const updateCommand = (updatedFields: Partial<Commands>) => {
        console.log('pre-update', commands[commandId], updatedFields);

        commands[commandId] = recursiveMerge<Commands>(commands[commandId], updatedFields)

        console.log('post-update', commands[commandId]);

        handleUpdate();
    }

    if (isLoading || !command) return <div>Loading...</div>

    const CommandConfig = () => {
        switch (command.type) {
            case 'script':
                return (
                    <>
                        <label htmlFor='file'>
                            File
                        </label>
                        {
                            command.commandConfig.path ? (
                                <div className='flex justify-between gap-2'>
                                    <input defaultValue={command.commandConfig.path as string}
                                           id='file'
                                           name='file'
                                           readOnly
                                           disabled
                                           className='text-black w-full'/>
                                    <button onClick={() => updateCommand({commandConfig: {path: ''}})}
                                            type='button'>unset
                                    </button>
                                </div>
                            ) : (
                                <input
                                    id='file'
                                    name='file'
                                    placeholder='Command Script'
                                    type='file'
                                    className='text-black w-full'
                                    // currentTarget.checkValidity() does not allow empty fields :/
                                    onChange={({currentTarget}) => currentTarget.checkValidity() && updateCommand({
                                        commandConfig: {
                                            path: getPathForFile(currentTarget.files[0]),
                                        }
                                    })}
                                />
                            )
                        }
                        <hr/>
                    </>
                )
            case 'shell':
                return (
                    <>
                        <label htmlFor='code'>
                            Shell Code
                        </label>
                        <textarea
                            id='code'
                            name='code'
                            placeholder='Command Code'
                            className='text-black'
                            value={command?.commandConfig?.code as string ?? ''}
                            // currentTarget.checkValidity() does not allow empty fields :/
                            onChange={({currentTarget}) => currentTarget.checkValidity() && updateCommand({
                                commandConfig: {
                                    code: currentTarget.value,
                                }
                            })}
                        />
                        <hr/>
                    </>
                )
        }
    }

    return (
        <form className="flex flex-col gap-3">
            <label htmlFor='name'>
                Name
            </label>
            <input
                id='name'
                name='name'
                placeholder='Command Name'
                required
                className='text-black'
                value={command.name}
                // currentTarget.checkValidity() does not allow empty fields :/
                onChange={({currentTarget}) => currentTarget.checkValidity() && updateCommand({name: currentTarget.value})}
            />
            <hr/>
            <label htmlFor='aliases'>
                Aliases
            </label>
            <input
                id='aliases'
                name='aliases'
                placeholder='Command Aliases'
                className='text-black'
                value={command.aliases.join(', ')}
                onChange={({currentTarget}) => updateCommand({aliases: currentTarget.value.split(',').map(alias => alias.trim())})}
            />
            <hr/>
            <label htmlFor='hotkey'>
                Hotkey
            </label>
            <input
                id='hotkey'
                name='hotkey'
                placeholder='Command Hotkey'
                className='text-black'
                value={command.hotkey}
                onChange={({currentTarget}) => updateCommand({hotkey: currentTarget.value})}
            />
            <hr/>
            <CommandConfig/>
            <button onClick={() => emitButtonClick('cancel')} type='button'>Done Editing</button>
        </form>
    )
}