import {TaskId, TasksSettings} from "@qommand/common/src/settings/tasks.settings.types";
import {useSettings} from "../../hooks/useSettings";

export type EditTaskProps = { taskId: TaskId }

export const EditTask = ({taskId}: EditTaskProps) => {
    const {isLoading, settings, updateSettings} = useSettings<TasksSettings>('tasks');
    const {tasks} = settings;

    return <div>
        Wow
    </div>
}