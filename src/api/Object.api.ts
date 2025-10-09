// src/api/object.api.ts - обновленный API

import { createApi } from '@reduxjs/toolkit/query/react';
import { getBaseQuery } from 'common/helpers';
import { IGetObjectParams, ObjectHistoryResponse, ObjectItem, ObjectUpdateBody } from 'types/entities/objects';
import { IGetObjectChangeHistoryParams, IGetObjectChangeHistoryResponse } from 'types/requests';

export interface IGetObjectsParams {
  customer?: number;
  ordering?: string;
  page?: number;
  page_size?: number;
  search?: string;
  status?: string;
  type?: string;
}

export const objectApi = createApi({
  reducerPath: 'objectApi',
  baseQuery: getBaseQuery(),
  tagTypes: ['Object'],
  endpoints: (build) => ({
    getAllObjects: build.query<{ results: ObjectItem[]; count: number }, IGetObjectParams>({
      query: (params) => ({
        url: 'object/',
        method: 'GET',
        params
      }),
      providesTags: ['Object']
    }),

    getObjectById: build.query<ObjectItem, number>({
      query: (id) => ({
        url: `object/${id}`,
        method: 'GET'
      }),
      providesTags: (_, __, id) => [{ type: 'Object', id }]
    }),

    updateObject: build.mutation<ObjectItem, { id: number; body: ObjectUpdateBody }>({
      query: ({ id, body }) => ({
        url: `object/${id}`,
        method: 'PUT',
        body
      }),
      invalidatesTags: (_, __, { id }) => [{ type: 'Object', id }, 'Object']
    }),

    // PATCH object/{id} — частичное обновление
    patchObject: build.mutation<ObjectItem, { id: number; body: Partial<ObjectUpdateBody> }>({
      query: ({ id, body }) => ({
        url: `object/${id}`,
        method: 'PATCH',
        body
      }),
      invalidatesTags: (_, __, { id }) => [{ type: 'Object', id }, 'Object']
    }),

    deleteObject: build.mutation<void, number>({
      query: (id) => ({
        url: `object/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Object']
    }),

    getObjectHistory: build.query<ObjectHistoryResponse, number>({
      query: (id) => ({
        url: `object/${id}/history`,
        method: 'GET'
      })
    }),

    getObjectChangeHistory: build.query<IGetObjectChangeHistoryResponse, IGetObjectChangeHistoryParams>({
      query: ({ object_id, ...params }) => ({
        url: `object/${object_id}/history/`,
        method: 'GET',
        params
      })
    }),

    // POST object/create
    createObject: build.mutation<ObjectItem, Partial<ObjectUpdateBody>>({
      query: (body) => ({
        url: 'object/create',
        method: 'POST',
        body
      }),
      invalidatesTags: ['Object']
    }),

    // Удобный метод для обновления только title
    updateObjectTitle: build.mutation<ObjectItem, { id: number; title: string }>({
      query: ({ id, title }) => ({
        url: `object/${id}`,
        method: 'PATCH',
        body: { title }
      }),
      invalidatesTags: (_, __, { id }) => [{ type: 'Object', id }, 'Object']
    })
  })
});

export const {
  useGetAllObjectsQuery,
  useLazyGetAllObjectsQuery,
  useGetObjectByIdQuery,
  useUpdateObjectMutation,
  usePatchObjectMutation,
  useDeleteObjectMutation,
  useGetObjectHistoryQuery,
  useGetObjectChangeHistoryQuery,
  useCreateObjectMutation,
  useUpdateObjectTitleMutation
} = objectApi;
