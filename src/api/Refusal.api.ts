import { createApi } from '@reduxjs/toolkit/query/react';
import { getBaseQuery } from 'common/helpers';
import { IPaginationMeta } from 'types/common';

interface RefusalCause {
  id: number;
  title: string;
  created_at: string;
}

interface RefusalFile {
  title: string;
  file: string;
  type: string;
  created_at: string;
}

interface RefusalResponse {
  next?: string;
  previous?: string;
  count?: number;
  results?: {
    causes: RefusalCause[];
    comment: string;
    ty: number;
    application: number;
    created_at: string;
    refusal_files: RefusalFile[];
  }[];
}

export interface RefusalBody {
  comment?: string;
  ty?: string;
  application?: string;
  refusal_files: { title?: string; type?: string; file: File }[];
  causes_ids: number[];
}

interface RefusalHistoryItem {
  history_user: string;
  history_date: string;
  history_type: string;
}

interface IRefusalCauseResponse extends IPaginationMeta {
  results: RefusalCause[];
}

export const refusalApi = createApi({
  reducerPath: 'refusalApi',
  baseQuery: getBaseQuery(),
  endpoints: (build) => ({
    getRefusals: build.query<RefusalResponse, void>({
      query: () => ({
        url: 'refusal/',
        method: 'GET'
      })
    }),

    getRefusalById: build.query<RefusalResponse, number>({
      query: (id) => ({
        url: `refusal/${id}`,
        method: 'GET'
      })
    }),

    updateRefusal: build.mutation<RefusalResponse, { id: number; body: RefusalBody }>({
      query: ({ id, body }) => ({
        url: `refusal/${id}`,
        method: 'PUT',
        body
      })
    }),

    patchRefusal: build.mutation<RefusalResponse, { id: number; body: Partial<RefusalBody> }>({
      query: ({ id, body }) => ({
        url: `refusal/${id}`,
        method: 'PATCH',
        body
      })
    }),

    deleteRefusal: build.mutation<void, number>({
      query: (id) => ({
        url: `refusal/${id}`,
        method: 'DELETE'
      })
    }),

    getRefusalHistory: build.query<RefusalHistoryItem[], number>({
      query: (id) => ({
        url: `refusal/${id}/history/`,
        method: 'GET'
      })
    }),

    getRefusalCauses: build.query<IRefusalCauseResponse, void>({
      query: () => ({
        url: 'refusal/causes',
        method: 'GET'
      })
    }),

    checkRefuseByCustomer: build.query<RefusalResponse, number>({
      query: (customerId) => ({
        url: `refusal/check-refuse/customer/${customerId}/`,
        method: 'GET'
      })
    }),

    checkRefuseByEntity: build.query<RefusalResponse, number>({
      query: (entityId) => ({
        url: `refusal/check-refuse/entity/${entityId}/`,
        method: 'GET'
      })
    }),

    // Check TU by customer
    checkTuByCustomer: build.query<unknown, number>({
      query: (customerId) => ({
        url: `refusal/check-tu/customer/${customerId}/`,
        method: 'GET'
      })
    }),

    // Check TU by entity (object)
    checkTuByEntity: build.query<unknown, number>({
      query: (entityId) => ({
        url: `refusal/check-tu/entity/${entityId}/`,
        method: 'GET'
      })
    }),

    searchRefusal: build.query<unknown, { application?: number | string; ty?: number | string }>({
      query: ({ application, ty }) => ({
        url: 'refusal/search/',
        method: 'GET',
        params: { application, ty }
      })
    }),

    createRefusal: build.mutation<RefusalResponse, RefusalBody>({
      query: (body) => {
        const formData = new FormData();

        if (body.refusal_files?.length) {
          formData.append('refusal_files', JSON.stringify(body.refusal_files));
          body.refusal_files.forEach((item, index) => {
            if (item.title !== undefined) {
              formData.append(`refusal_files[${index}][title]`, String(item.title));
            }
            if (item.type !== undefined) {
              formData.append(`refusal_files[${index}][type]`, String(item.type));
            }
          });
        }

        if (body.comment !== undefined) {
          formData.append('comment', String(body.comment));
        }
        if (body.ty !== undefined) {
          formData.append('ty', String(body.ty));
        }
        if (body.application !== undefined) {
          formData.append('application', String(body.application));
        }

        if (Array.isArray(body.causes_ids)) {
          body.causes_ids.forEach((id) => {
            formData.append('causes_ids', String(id));
          });
        }

        return {
          url: 'refusal/create',
          method: 'POST',
          body: formData
        };
      }
    })
  })
});

export const {
  useGetRefusalsQuery,
  useGetRefusalByIdQuery,
  useUpdateRefusalMutation,
  usePatchRefusalMutation,
  useDeleteRefusalMutation,
  useGetRefusalHistoryQuery,
  useGetRefusalCausesQuery,
  useCheckRefuseByCustomerQuery,
  useLazyCheckRefuseByCustomerQuery,
  useCheckRefuseByEntityQuery,
  useLazyCheckRefuseByEntityQuery,
  useLazyCheckTuByCustomerQuery,
  useLazyCheckTuByEntityQuery,
  useSearchRefusalQuery,
  useLazySearchRefusalQuery,
  useCreateRefusalMutation
} = refusalApi;
