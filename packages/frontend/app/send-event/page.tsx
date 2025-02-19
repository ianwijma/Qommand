import {DefaultWindowContainer} from "../../components/windowContainer/DefaultWindowContainer";
import {Metadata} from "next";
import {Button} from "./button";
import {Listen} from "../receive-event/listen";

export const metadata: Metadata = {
    title: 'Settings',
}

export default function SettingsPage() {
    return <DefaultWindowContainer title='Send Event'>
        Settings Page
        <Button/>

        <Listen/>
    </DefaultWindowContainer>
}