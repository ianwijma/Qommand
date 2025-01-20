import {TaskId, Tasks, TasksSettings} from "@qommand/common/src/settings/tasks.settings.types";
import {useSettings} from "../../hooks/useSettings";

export type EditTaskProps = { taskId: TaskId }

export const EditTask = ({taskId}: EditTaskProps) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {isLoading, settings, updateSettings} = useSettings<TasksSettings>('tasks');

    if (isLoading) return <span>loading...</span>

    const {tasks} = settings;
    const task = tasks[taskId];

    if (!task) return <span>Unknown task ({taskId})...</span>

    // TODO: replace with form logic...
    const updateTask = (updatedTask: Partial<Tasks>) => {
        Object.keys(updatedTask).forEach((key) => {
            task[key] = updatedTask[key];
        });

        updateSettings(settings);
    }

    return <div>
        <input
            className='text-black'
            defaultValue={task.name}/>
        <br/>
        {task.type}
        {
            'code' in task ? (
                <>
                    <br/>
                    <textarea defaultValue={task.code ?? ''} className='text-black'>

                    </textarea>
                </>
            ) : ''
        }
    </div>
}