import { createApi } from '@reduxjs/toolkit/query/react';
import { getBaseQuery } from 'common/helpers';
import {
  ICreateFolderParams,
  ICreateFolderResponse,
  IFileListResponse,
  IGetFileFolderFoldersParams,
  IGetFileFolderFoldersResponse,
  IGetFileListParams,
  IUploadFileParams
} from 'types/requests';

export const filefolderApi = createApi({
  reducerPath: 'filefolderApi',
  baseQuery: getBaseQuery(),
  tagTypes: ['FileFolder', 'FileList'],
  endpoints: (build) => ({
    getFilefolderFiles: build.query<IFileListResponse, IGetFileListParams>({
      query: ({ ordering = 'created_at', folder_id, ty_id, ...params }) => ({
        url: `filefolder/${folder_id}/files/${ty_id}`,
        method: 'GET',
        params: { ...params, ordering }
      }),
      providesTags: ['FileFolder', 'FileList']
    }),

    createFilefolder: build.mutation<ICreateFolderResponse, ICreateFolderParams>({
      query: (body) => ({
        url: 'filefolder/create/',
        method: 'POST',
        body
      }),
      invalidatesTags: ['FileFolder', 'FileList']
    }),

    uploadFile: build.mutation<void, IUploadFileParams>({
      query: (body) => {
        const formData = new FormData();
        formData.append('folder', body.folder);
        formData.append('ty', body.ty);
        body.files.forEach((file) => {
          formData.append('files', file);
        });
        return {
          url: 'filefolder/files/upload/',
          method: 'POST',
          body: formData
        };
      },
      invalidatesTags: ['FileFolder', 'FileList']
    }),
    getFolders: build.query<IGetFileFolderFoldersResponse, IGetFileFolderFoldersParams>({
      query: ({ ty_id }) => ({
        url: `filefolder/tu/${ty_id}/folders/`,
        method: 'GET'
      }),
      providesTags: ['FileFolder', 'FileList']
    })
  })
});

export const { useGetFilefolderFilesQuery, useCreateFilefolderMutation, useUploadFileMutation, useGetFoldersQuery } = filefolderApi;
