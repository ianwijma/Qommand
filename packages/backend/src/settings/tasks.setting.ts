import {createSettings} from "./createSettings";
import {TasksSettings} from "@qommand/common/src/settings/tasks.settings.types";


export const tasksSettings = createSettings<TasksSettings>({
    name: 'tasks',
    defaultSettings: {
        version: 1,
        tasks: []
    },
});