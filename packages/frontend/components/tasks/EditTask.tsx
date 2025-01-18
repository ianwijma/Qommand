import {TaskId, Tasks, TasksSettings} from "@qommand/common/src/settings/tasks.settings.types";
import {
    runShellRequestName,
    RunShellRequestReq,
    RunShellRequestRes
} from "@qommand/common/src/requests/runShell.request";
import {useSettings} from "../../hooks/useSettings";
import {responseHandler} from "../../utils/responseHandler";

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

    const runJavascript = async (): Promise<void> => {
        console.log("Run Shell", task);
        if (task.type !== "noop") {
            const response = await responseHandler.requestResponse<RunShellRequestRes, RunShellRequestReq>(runShellRequestName, {
                code: `
ls -lah
                `
            });

            console.log("Ran Shell", response);
        }
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
        <br/>
        <button onClick={() => runJavascript()}>Run Code</button>
    </div>
}