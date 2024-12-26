'use client'

import {useRef} from "react";
import {useSearchParams} from "next/navigation";
import {emitButtonClickedEvent} from '@qommand/common/src/events/buttonClicked.event'

export const PageContent = () => {
    const ref = useRef<HTMLInputElement>(null);
    const searchParams = useSearchParams();
    const dialogId = searchParams.get('dialogId');
    const message = searchParams.get('message');
    const inputPlaceholder = searchParams.get('inputPlaceholder');

    const handleCancel = () => emitButtonClickedEvent(`cancel::${dialogId}`);
    const handleOk = () => emitButtonClickedEvent(`ok::${dialogId}`, {input: ref.current.value});

    return (
        <>
            <span>
                {message}
            </span>
            <input ref={ref} placeholder={inputPlaceholder}/>
            <button onClick={handleCancel}>Cancel</button>
            <button onClick={handleOk}>Ok</button>
        </>
    )
}