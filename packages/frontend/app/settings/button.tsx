'use client'

export const Button = () => {
    const onClick = () => {
        // @ts-ignore
        window.windowApi.click()
    }
    return <button onClick={onClick}>Click me!~</button>
}