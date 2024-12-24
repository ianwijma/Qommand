import {DefaultWindowContainer} from "../../components/windowContainer/DefaultWindowContainer";
import {TaskList} from "./TaskList";


export default function QommandPage() {
    return <DefaultWindowContainer title={"Tasks"}>
        <TaskList/>
    </DefaultWindowContainer>
}