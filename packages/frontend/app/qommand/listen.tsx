'use client'

import {useState} from "react";

export const Listen = () => {
    const [clicked, setClicked] = useState(false);

    // @ts-ignore
    window.windowApi.onClick(() => {
        setClicked(true);

        setTimeout(() => setClicked(false), 1000);
    });

    return <div className={clicked ? 'bg-green-500' : 'bg-red-500'}>
        {clicked ? 'Clicked' : 'Awaiting click'}
    </div>
}