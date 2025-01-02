import type {Metadata} from "next";
import {addEmitEventHandler} from "@qommand/common/src/eventSubscriptions";
import {Geist, Geist_Mono} from "next/font/google";
import "./globals.css";
import '../envConfig.ts'

import {config} from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css'

config.autoAddCss = false

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: {
        template: '%s | Qommand',
        default: 'Qommand', // a default is required when creating a template
    },
    description: "Qommand & Qonquer",
};

addEmitEventHandler((event, ...args) => {
    console.log('nextJS memes', event, args);
    // @ts-ignore
    window?.eventSubscriptionApi?.emitEvent(event, ...args);
})

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
        <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
        {children}
        </body>
        </html>
    );
}
