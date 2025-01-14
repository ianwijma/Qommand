'use client'

import {useRef} from "react";
import {useSearchParams} from "next/navigation";
import {emitButtonClick} from "../../../utils/emitButtonClick";

export const PageContent = () => {
    const ref = useRef<HTMLInputElement>(null);
    const searchParams = useSearchParams();
    const dialogId = searchParams.get('__id');
    const message = searchParams.get('message');
    const inputPlaceholder = searchParams.get('inputPlaceholder');

    const handleCancel = () => emitButtonClick(`cancel::${dialogId}`);
    const handleOk = () => {
        console.log('handleOk')
        emitButtonClick(`ok::${dialogId}`, {input: ref.current.value})
    };

    return (
        <>
            <span>
                {message}
            </span>
            <input ref={ref} placeholder={inputPlaceholder} className='text-black'/>
            <button onClick={handleCancel}>Cancel</button>
            <button onClick={handleOk}>Ok</button>
        </>
    )
}