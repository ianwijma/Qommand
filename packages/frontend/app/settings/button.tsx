'use client'

import {useEventSubscriptions} from "../../hooks/useEventSubscriptions";
import {ButtonClickedEvent} from '@qommand/common/src/events/buttonClicked.event'

export const Button = () => {
    const {emitEvent} = useEventSubscriptions()

    const onClick = () => emitEvent(ButtonClickedEvent)

    return <button onClick={onClick}>Click me!~</button>
}