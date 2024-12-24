'use client';

import {useSettings} from "../../hooks/useSettings";
import {Tasks, TasksSettings} from "@qommand/common/src/settings/tasks.settings.types";

export const TaskList = () => {
    const {isLoading, settings, updateSettings} = useSettings<TasksSettings>('tasks');

    if (isLoading) {
        return <div>Loading...</div>;
    }

    const {tasks} = settings ?? {};
    const addTask = (): void => {
        tasks.push({
            id: Math.random().toString(36),
            name: 'Some name',
            type: 'noop',
        });
        updateSettings(settings);
    }

    return <div>
        <button onClick={addTask}>Add Tasks</button>
        <ul>
            {tasks.map((task: Tasks) => {
                return <li key={task.id}>{task.name}</li>
            })}
        </ul>
    </div>;
}