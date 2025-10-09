import { IPaginationMeta } from 'types/common';
import { ICategory, IFileFolderFolder, IFileItem } from 'types/entities';

export type IFileListResponse = IPaginationMeta & {
  results: IFileItem[];
};
export type IGetFileListParams = {
  folder_id: string;
  ty_id: string;
  ordering?: string;
  page?: number;
  page_size?: number;
};

export interface ICreateFolderParams {
  title: string;
  description?: string;
  category: string;
  ty?: string;
}

export interface ICreateFolderResponse {
  id: number;
  category: ICategory;
  title: string;
  description?: string;
  ty: string;
  created_at: string;
  updated_at: string;
}

export type IGetFileFolderFoldersResponse = IFileFolderFolder;
export type IGetFileFolderFoldersParams = { ty_id: string };

export type IUploadFileParams = {
  folder: string;
  files: File[];
  ty: string;
};
