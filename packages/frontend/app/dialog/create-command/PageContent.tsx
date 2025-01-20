'use client'

import {useRef} from "react";
import {SimpleEventBusData} from "@qommand/common/src/eventbus.types";
import {useButtonClick} from "../../../hooks/useButtonClick";

export const PageContent = () => {
    const {emitButtonClick} = useButtonClick();
    const formRef = useRef<HTMLFormElement>(null);

    const CommandTypes = {
        'script': "Script",
        'shell': "Shell command",
    }

    const handleCancel = () => emitButtonClick('cancel');
    const handleConfirm = () => {
        const form = formRef.current;
        const data: SimpleEventBusData = Object.fromEntries(new FormData(form)) as SimpleEventBusData;
        emitButtonClick('confirm', data)
    };

    return (
        <form ref={formRef} className="flex flex-col gap-3">
            <span>
                Create a task
            </span>
            <input name='name' placeholder='Command Name' className='text-black'/>
            <div>
                {
                    Object.keys(CommandTypes).map((taskType, index) => {
                        const typeName = CommandTypes[taskType];

                        return (
                            <div key={taskType}>
                                <input type='radio' name='type' value={taskType} defaultChecked={index === 0}/>
                                <label htmlFor={taskType}>{typeName}</label>
                            </div>
                        )
                    })
                }
            </div>
            <button onClick={handleCancel}>Cancel</button>
            <button onClick={handleConfirm}>Confirm</button>
        </form>
    )
}