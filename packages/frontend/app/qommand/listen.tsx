'use client'

import {useState} from "react";
import {useEventSubscriptions} from "../../hooks/useEventSubscriptions";
import {ButtonClickedEvent} from '@qommand/common/src/events/buttonClicked.event'

export const Listen = () => {
    const {subscribe} = useEventSubscriptions()
    const [clicked, setClicked] = useState(false);

    subscribe(ButtonClickedEvent, {
        0: () => {
            setClicked(true);

            setTimeout(() => setClicked(false), 1000);
        }
    })

    return <div className={clicked ? 'bg-green-500' : 'bg-red-500'}>
        {clicked ? 'Clicked' : 'Awaiting click'}
    </div>
}