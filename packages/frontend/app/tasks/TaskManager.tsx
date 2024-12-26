'use client';

import {FolderList} from "../../components/folders/FolderList";
import {EditTask} from "../../components/tasks/EditTask";
import {useSettings} from "../../hooks/useSettings";
import {TaskId, TasksSettings} from "@qommand/common/src/settings/tasks.settings.types";
import {useState} from "react";
import {FolderId, FolderSettings} from "@qommand/common/src/settings/folders.settings.types";

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
    const unsetTaskId = () => setTaskId(null);
    const [folderId, setFolderId] = useState<null | FolderId>(null);
    const unsetFolderId = () => setFolderId(null);

    const isLoading = isLoadingTasks || isLoadingFolder;
    if (isLoading) {
        return <span>Loading...</span>
    }

    const handleClick = (folderId: FolderId, taskId: TaskId) => {
    }

    return <div className="w-full h-screen flex flex-row">
        <div className="w-2/3 border-r-2 border-r-slate-800">
            {taskId ? <EditTask taskId={taskId}/> : <span>Select a task</span>}
        </div>
        <div className='w-1/3'>
            <FolderList folderSettings={folderSettings} onClick={handleClick}/>
        </div>
    </div>
}