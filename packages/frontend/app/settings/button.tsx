'use client'

import {emitButtonClick} from "../../utils/emitButtonClick";

export const Button = () => {
    const onClick = () => emitButtonClick('super-special-state')

    return <button onClick={onClick}>Click me!~</button>
}