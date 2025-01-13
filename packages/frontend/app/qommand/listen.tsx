'use client'

import {useEffect, useState} from "react";
import {eventHandler} from "../../utils/eventHandler";
import {
    specialButtonClickedName,
    type SpecialButtonClickedData
} from '@qommand/common/src/events/specialButtonClicked.event'

export const Listen = () => {
    const [clicked, setClicked] = useState(false);

    useEffect(() => eventHandler.listen<SpecialButtonClickedData>(specialButtonClickedName, () => {
        setClicked(true);

        setTimeout(() => setClicked(false), 1000);
    }), [])


    return <div className={clicked ? 'bg-green-500' : 'bg-red-500'}>
        {clicked ? 'Clicked' : 'Awaiting click'}
    </div>
}