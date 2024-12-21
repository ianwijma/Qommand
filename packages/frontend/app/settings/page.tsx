import {DefaultWindowContainer} from "@/components/windowContainer/DefaultWindowContainer";
import {Metadata} from "next";
import {Button} from "./button";

export const metadata: Metadata = {
    title: 'Settings',
}

export default function SettingsPage() {
    return <DefaultWindowContainer title={"Qommand Settings"}>
        Settings Page
        <Button/>
    </DefaultWindowContainer>
}