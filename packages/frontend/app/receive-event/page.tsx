import {DefaultWindowContainer} from "../../components/windowContainer/DefaultWindowContainer";
import {Listen} from "./listen";


export default function QommandPage() {
    return <DefaultWindowContainer title={"Qommand"}>
        Qommand Page
        <Listen/>
    </DefaultWindowContainer>
}