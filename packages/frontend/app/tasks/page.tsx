import {DefaultWindowContainer} from "../../components/windowContainer/DefaultWindowContainer";
import {TaskManager} from "./TaskManager";


export default function QommandPage() {
    return <DefaultWindowContainer title={"Tasks"}>
        <TaskManager/>
    </DefaultWindowContainer>
}