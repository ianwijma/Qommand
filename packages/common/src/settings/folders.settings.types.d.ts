import {BaseSettings} from "../settings.types";

export type FolderId = string;
export type FolderName = string;
export type TargetId = string;

export type SubFolders = { [key: FolderId]: Folder };

export type Folder = {
    id: FolderId;
    name: FolderName;
    collapsed: boolean;
    targetId: null | TargetId; // The id of what we're targeting;
    subFolders: null | SubFolders;
}

export type FolderSettings = BaseSettings & {
    subFolders: SubFolders
};