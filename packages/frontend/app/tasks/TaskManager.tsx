'use client';

import {FolderList} from "../../components/folders/FolderList";
import {EditTask} from "../../components/tasks/EditTask";
import {useSettings} from "../../hooks/useSettings";
import {TaskId, TasksSettings} from "@qommand/common/src/settings/tasks.settings.types";
import {useState} from "react";
import {FolderId, FolderSettings, SubFolders} from "@qommand/common/src/settings/folders.settings.types";
import {nanoid} from "nanoid";
import {createDialog} from "../../utils/createDialog";

export const TaskManager = () => {
    const {
        isLoading: isLoadingTasks,
        settings: taskSettings,
        updateSettings: updateTaskSettings
    } = useSettings<TasksSettings>('tasks');
    const {
        isLoading: isLoadingFolder,
        settings: folderSettings,
        updateSettings: updateFolderSettings
    } = useSettings<FolderSettings>('folder-tasks');
    const [taskId, setTaskId] = useState<null | TaskId>(null);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const unsetTaskId = () => setTaskId(null);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [folderId, setFolderId] = useState<null | FolderId>(null);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const unsetFolderId = () => setFolderId(null);

    const handleFolderUpdate = () => updateFolderSettings(folderSettings);
    const handleTaskUpdate = () => updateTaskSettings(taskSettings);

    const handleCreateFolder = async (subFolders: SubFolders) => {
        const {success, data} = await createDialog<{ input: string }>({
            type: 'input',
            message: 'Give folder name',
            title: 'Give folder name',
        });

        if (success) {
            const {input} = data;

            if (input.trim()) {
                const newFolderId: FolderId = nanoid();

                subFolders[newFolderId] = {
                    id: newFolderId,
                    collapsed: false,
                    name: input.trim(),
                    subFolders: {},
                    targetId: null
                }

                handleFolderUpdate();
            }
        }
    }

    const handleCreateTask = async (subFolders: SubFolders) => {
        const {success, data} = await createDialog<{ input: string }>({
            type: 'input',
            message: 'Give task name',
            title: 'Give task name',
        });

        if (success) {
            const {input} = data;

            if (input.trim()) {
                const newFolderId: FolderId = nanoid();
                const newTaskId: TaskId = nanoid();

                taskSettings.tasks[newTaskId] = {
                    id: newTaskId,
                    type: "shell-script",
                    name: input,
                    script: ''
                }

                handleTaskUpdate();

                subFolders[newFolderId] = {
                    id: newFolderId,
                    collapsed: false,
                    name: input.trim(),
                    subFolders: {},
                    targetId: newTaskId
                }

                handleFolderUpdate();
            }
        }
    }

    const isLoading = isLoadingTasks || isLoadingFolder;
    if (isLoading) {
        return <span>Loading...</span>
    }

    const handleClick = (_: FolderId, taskId: TaskId) => {
        setTaskId(taskId);
    }

    return <div className="w-full h-screen flex flex-row">
        <div className="w-2/3 border-r-2 border-r-slate-800">
            {taskId ? <EditTask taskId={taskId}/> : <span>Select a task</span>}
        </div>
        <div className='w-1/3'>
            <FolderList
                folderSettings={folderSettings}
                onClick={handleClick}
                handleUpdate={handleFolderUpdate}
                handleCreateFolder={handleCreateFolder}
                handleCreateTarget={handleCreateTask}
            />
        </div>
    </div>
}