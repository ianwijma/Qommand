import {DefaultWindowContainer} from "../../components/windowContainer/DefaultWindowContainer";
import {Listen} from "./listen";


export default function QommandPage() {
    return <DefaultWindowContainer title='Receive Event'>
        Qommand Page
        <Listen/>
    </DefaultWindowContainer>
}