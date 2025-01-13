'use client'

import {
    specialButtonClickedName,
    type SpecialButtonClickedData
} from '@qommand/common/src/events/specialButtonClicked.event'
import {eventHandler} from "../../utils/eventHandler";

export const Button = () => {
    const onClick = () => eventHandler.emit<SpecialButtonClickedData>(specialButtonClickedName)

    return <button onClick={onClick}>Click me!~</button>
}