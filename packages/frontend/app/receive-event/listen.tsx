'use client'

import {useState} from "react";
import {useOnButtonClicked} from "../../utils/emitButtonClick";

export const Listen = () => {
    const [clicked, setClicked] = useState(false);

    useOnButtonClicked('super-special-state', () => {
        setClicked(true);

        setTimeout(() => setClicked(false), 1000);
    })

    return <div className={clicked ? 'bg-green-500' : 'bg-red-500'}>
        {clicked ? 'Clicked' : 'Awaiting click'}
    </div>
}