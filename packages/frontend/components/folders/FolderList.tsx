import {
    Folder,
    FolderId,
    FolderSettings,
    SubFolders,
    TargetId
} from '@qommand/common/src/settings/folders.settings.types'

const hasSubFolders = (subFolders: SubFolders): boolean => Object.keys(subFolders).length > 0;

const MAX_LEVEL = 5;

// TODO: Replace by context
type LevelParams = { level: number }
type OnClickParams = { onClick: (folderId: FolderId, targetId: TargetId) => void }
type HandleUpdateParams = {
    handleUpdate: () => void,
    handleCreateFolder: (subFolders: SubFolders) => void | Promise<void>
    handleCreateTarget: (subFolders: SubFolders) => void | Promise<void>
}
type PropDrillParams = LevelParams & OnClickParams

type FoldersParams = PropDrillParams & HandleUpdateParams & { subFolders: SubFolders };


const Folders = ({subFolders, level, onClick, handleUpdate, handleCreateFolder, handleCreateTarget}: FoldersParams) => {
    return (
        <ul style={{paddingLeft: `${level * 10}px`}}>
            {level === 0 ? (
                <li className='flex justify-between border-0 border-b'>
                    <b>Folders</b>
                    <button onClick={() => handleCreateFolder(subFolders)}>Create folder</button>
                </li>
            ) : ''}
            {
                hasSubFolders(subFolders)
                    ? Object.keys(subFolders).map((folderId) => {
                        const folder = subFolders[folderId];
                        return <FolderItem
                            level={level + 1}
                            key={folderId}
                            folder={folder}
                            onClick={onClick}
                            handleCreateFolder={handleCreateFolder}
                            handleUpdate={handleUpdate}
                            handleCreateTarget={handleCreateTarget}
                        />;
                    })
                    : ''
            }
        </ul>
    )
}

type FolderItemParams = PropDrillParams & HandleUpdateParams & { folder: Folder };

const FolderItem = ({
                        level,
                        folder,
                        onClick,
                        handleUpdate,
                        handleCreateFolder,
                        handleCreateTarget
                    }: FolderItemParams) => {
    const {id, name, collapsed, targetId, subFolders} = folder;
    const toggleCollapse = () => {
        folder.collapsed = !collapsed;

        handleUpdate();
    }

    return (
        <li key={id}>
            <span className='flex justify-between'>
                <span>
                    {hasSubFolders(subFolders) ? (
                        <button onClick={toggleCollapse} className='mr-2'>
                            {collapsed ? 'V' : '>'}
                        </button>
                    ) : ''}
                    <button onClick={() => targetId === null ? toggleCollapse() : onClick(id, targetId)}>
                        {name}
                    </button>
                </span>
                <span>
                    {
                        targetId === null ? (
                            <button onClick={() => handleCreateTarget(subFolders)}>New Command</button>
                        ) : ''
                    }
                    {' '}
                    {
                        targetId === null && level < MAX_LEVEL
                            ? (
                                <button onClick={() => handleCreateFolder(subFolders)}>Create folder</button>
                            )
                            : ''
                    }
                </span>
            </span>
            <div style={{height: collapsed ? 0 : 'auto'}} className='overflow-hidden'>
                <Folders
                    subFolders={subFolders}
                    onClick={onClick}
                    level={level}
                    handleUpdate={handleUpdate}
                    handleCreateFolder={handleCreateFolder}
                    handleCreateTarget={handleCreateTarget}
                />
            </div>
        </li>
    )
}

type FolderListParams = OnClickParams & HandleUpdateParams & { folderSettings: FolderSettings };

export const FolderList = ({
                               folderSettings,
                               onClick,
                               handleUpdate,
                               handleCreateFolder,
                               handleCreateTarget
                           }: FolderListParams) => {
    const {subFolders} = folderSettings;
    const level = 0;

    return <Folders
        level={level}
        subFolders={subFolders}
        onClick={onClick}
        handleUpdate={handleUpdate}
        handleCreateFolder={handleCreateFolder}
        handleCreateTarget={handleCreateTarget}
    />
}