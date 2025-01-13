'use client'

import {
    specialButtonClickedEventName,
    type SpecialButtonClickedEventData
} from '@qommand/common/src/events/specialButtonClicked.event'
import {eventHandler} from "../../utils/eventHandler";

export const Button = () => {
    const onClick = () => eventHandler.emit<SpecialButtonClickedEventData>(specialButtonClickedEventName)

    return <button onClick={onClick}>Click me!~</button>
}