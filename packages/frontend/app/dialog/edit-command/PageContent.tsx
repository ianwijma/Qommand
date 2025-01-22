'use client'

import {useEffect, useRef} from "react";
import {useSettings} from "../../../hooks/useSettings";
import {Commands, CommandSettings} from "@qommand/common/src/settings/commands.settings.types";
import {useSearchParams} from "next/navigation";
import {getPathForFile} from "../../../utils/files";
import {useButtonClick} from "../../../hooks/useButtonClick";

export const PageContent = () => {
    const {emitButtonClick} = useButtonClick();
    const formRef = useRef<HTMLFormElement>(null);

    const searchParams = useSearchParams();
    const commandId = searchParams.get('commandId');

    const {isLoading, settings, updateSettings} = useSettings<CommandSettings>('commands');
    const handleUpdate = () => updateSettings(settings);

    const {commands = {}} = settings ?? {};
    const command = commands[commandId];
    const updateCommand = (updatedFields: Partial<Commands>) => {
        Object.keys(updatedFields).forEach((key: string) => {
            command[key] = updatedFields[key];
        });

        handleUpdate();
    }

    useEffect(() => console.log('Command updated', command), [command]);

    if (isLoading) return <div>Loading...</div>

    const CommandConfig = () => {
        switch (command.type) {
            case 'script':
                return (
                    <>
                        <label htmlFor='file'>
                            File
                        </label>
                        <input
                            id='file'
                            name='file'
                            placeholder='Command Script'
                            type='file'
                            className='text-black'
                            // currentTarget.checkValidity() does not allow empty fields :/
                            onChange={({currentTarget}) => currentTarget.checkValidity() && updateCommand({
                                commandConfig: {
                                    path: getPathForFile(currentTarget.files[0]),
                                }
                            })}
                        />
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
        <form ref={formRef} className="flex flex-col gap-3">
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
            <button onClick={() => emitButtonClick('cancel')}>Done Editing</button>
        </form>
    )
}