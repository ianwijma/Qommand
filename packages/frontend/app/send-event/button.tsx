'use client'

import {useButtonClick} from "../../hooks/useButtonClick";

export const Button = () => {
    const {emitButtonClick} = useButtonClick();
    
    const onClick = () => emitButtonClick('super-special-state')

    return <button onClick={onClick}>Click me!~</button>
}