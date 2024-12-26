"use client";

import {PropsWithChildren} from "react";
import {TitleBar} from "../window/TitleBar";
import Head from "next/head";

type DefaultWindowContainerProps = PropsWithChildren & {
    title: string;
    showMinimize?: boolean;
    showClose?: boolean;
};

export const DefaultWindowContainer = ({children, title, showMinimize, showClose}: DefaultWindowContainerProps) => {
    return <div className='w-screen h-screen flex flex-col overflow-hidden'>
        <Head>
            <title>{title}</title>
        </Head>
        <TitleBar {...{showMinimize, showClose}}>{title}</TitleBar>
        <div className='flex flex-col bg-slate-700 h-full py-1 px-1 overflow-x-auto'>
            {children}
        </div>
    </div>
}