import type {Metadata} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import "./globals.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Qommand",
    description: "Qommand & Qonquer",
};

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
        <div id='title-bar' className='w-screen h-12 bg-gray-900'>
            border
            <button className='no-drag'>click</button>
        </div>
        <div className={'w-screen h-fit overflow-hidden'}>
            {children}
        </div>
        </body>
        </html>
    );
}
