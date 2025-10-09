import { createApi } from '@reduxjs/toolkit/query/react';
import { getBaseQuery } from 'common/helpers';
import type { IApplicationResponse, IApplicationsListResponse, ICreateApplicationResponse } from 'types/entities';
import type { IGetApplicationHistoryParams, IGetApplicationHistoryResponse, IGetApplicationsParams } from 'types/requests';

interface CreateApplicationRequest {
  customer: number;
  object: string;
  address: string;
  contact: string;
  quantity: string;
  pressure: string;
  waterRequired: string;
  firefightingExpensesInner: string;
  firefightingExpensesOuter: string;
  status: 'pending' | 'rejected' | 'approved' | 'contracted';
  entity: number;
  latitude: number;
  longitude: number;
}

interface UpdateApplicationRequest extends Omit<CreateApplicationRequest, 'customer'> {
  customer: number;
}

export const applicationsApi = createApi({
  reducerPath: 'applicationsApi',
  baseQuery: getBaseQuery(),
  endpoints: (build) => ({
    createApplication: build.mutation<ICreateApplicationResponse, CreateApplicationRequest>({
      query: (data) => {
        console.log('API: Отправляемые данные на сервер:', data);
        console.log('API: JSON строка:', JSON.stringify(data));

        return {
          url: 'application/create',
          method: 'POST',
          body: data,
          headers: {
            'Content-Type': 'application/json'
          }
        };
      },
      transformResponse: (response: ICreateApplicationResponse) => {
        console.log('API: Ответ от сервера:', response);
        return response;
      },
      transformErrorResponse: (response: { status: number; data?: unknown }) => {
        console.error('API: Ошибка от сервера:', response);
        return response;
      }
    }),
    getApplications: build.query<IApplicationsListResponse, IGetApplicationsParams>({
      query: ({ ordering = 'created_at', ...params }) => ({
        url: 'application/',
        method: 'GET',
        params: { ...params, ordering }
      })
    }),
    getApplicationById: build.query<IApplicationResponse, number | string>({
      query: (id) => ({
        url: `application/${id}`,
        method: 'GET'
      })
    }),
    updateApplication: build.mutation<IApplicationResponse, { id: number; body: Partial<UpdateApplicationRequest> }>({
      query: ({ id, body }) => ({
        url: `application/${id}`,
        method: 'PUT',
        body
      })
    }),
    initAddApplicationFile: build.mutation<void, { applicationId: number | string }>({
      query: ({ applicationId }) => ({
        url: `application/${applicationId}/files/`,
        method: 'POST'
      })
    }),
    uploadApplicationFiles: build.mutation<unknown, { application: number; files: File[] }>({
      query: ({ application, files }) => {
        const formData = new FormData();
        formData.append('application', String(application));
        files.forEach((file) => formData.append('files', file));
        return {
          url: 'application/files/upload/',
          method: 'POST',
          body: formData
        };
      }
    }),
    replaceApplicationFile: build.mutation<unknown, { id: number; file: File }>({
      query: ({ id, file }) => {
        const formData = new FormData();
        formData.append('file', file);
        return {
          url: `application/application-files/${id}/replace/`,
          method: 'PUT',
          body: formData
        };
      }
    }),
    deleteApplicationFile: build.mutation<void, { id: number }>({
      query: ({ id }) => ({
        url: `application/application-files/${id}/delete/`,
        method: 'DELETE'
      })
    }),
    approveApplication: build.mutation<void, { applicationId: string }>({
      query: ({ applicationId }) => ({
        url: `application/${applicationId}/approve/`,
        method: 'POST'
      })
    }),
    rejectApplication: build.mutation<void, { applicationId: string }>({
      query: ({ applicationId }) => ({
        url: `application/${applicationId}/reject/`,
        method: 'POST'
      })
    }),
    getApplicationHistory: build.query<IGetApplicationHistoryResponse, IGetApplicationHistoryParams>({
      query: ({ application_id, page, page_size }) => ({
        url: `application/${application_id}/history/`,
        method: 'GET',
        params: { page, page_size }
      })
    })
  })
});

export const {
  useCreateApplicationMutation,
  useGetApplicationsQuery,
  useGetApplicationByIdQuery,
  useUpdateApplicationMutation,
  useInitAddApplicationFileMutation,
  useUploadApplicationFilesMutation,
  useReplaceApplicationFileMutation,
  useDeleteApplicationFileMutation,
  useApproveApplicationMutation,
  useRejectApplicationMutation,
  useGetApplicationHistoryQuery
} = applicationsApi;
