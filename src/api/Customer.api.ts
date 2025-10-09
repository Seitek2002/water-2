import { createApi } from '@reduxjs/toolkit/query/react';
import { getBaseQuery } from 'common/helpers';
import {
  IGetCustomerChangeHistoryParams,
  IGetCustomerChangeHistoryResponse,
  IGetCustomerParams,
  IGetCustomerResponse
} from 'types/requests';

export interface ICustomer {
  id: number;
  full_name: string;
  category: string;
  created_at: string;
  updated_at: string;
  pasport: string | null;
  address: string;
  contact: string;
  status: string;
}

export interface ICustomersListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ICustomer[];
}

export interface IGetCustomersParams {
  page?: number;
  page_size?: number;
  ordering?: string;
  category?: '0' | '1';
  search?: string;
  status?: string;
}

export interface ICreateCustomerParams {
  full_name?: string | number;
  category?: '0' | '1';
  pasport?: string | null;
  address?: string;
  contact?: string;
  status?: string;
}

export const customerApi = createApi({
  reducerPath: 'customerApi',
  baseQuery: getBaseQuery(),
  tagTypes: ['Customer'],
  endpoints: (build) => ({
    getCustomer: build.query<IGetCustomerResponse, IGetCustomerParams>({
      query: (params) => ({
        url: '/customer/',
        method: 'GET',
        params
      }),
      providesTags: ['Customer']
    }),
    getAllCustomers: build.query<ICustomersListResponse, IGetCustomersParams>({
      query: ({ ordering = 'created_at', ...params }) => ({
        url: 'customer/',
        method: 'GET',
        params: { ...params, ordering }
      }),
      providesTags: ['Customer']
    }),

    getCustomerById: build.query<ICustomer, number | string>({
      query: (id) => ({
        url: `customer/${id}`,
        method: 'GET'
      }),
      providesTags: (_result, _error, id) => [{ type: 'Customer', id }, 'Customer']
    }),

    updateCustomer: build.mutation<ICustomer, { id: number | string; body: Partial<ICustomer> }>({
      query: ({ id, body }) => ({
        url: `customer/${id}`,
        method: 'PUT',
        body
      }),
      async onQueryStarted({ id, body }, { dispatch, queryFulfilled }) {
        // Optimistically update the cached customer details
        const patchResult = dispatch(
          customerApi.util.updateQueryData('getCustomerById', id, (draft) => {
            if (draft && body) {
              Object.assign(draft as unknown as ICustomer, body);
            }
          })
        );
        try {
          const { data } = await queryFulfilled;
          // Ensure cache is aligned with server response
          dispatch(
            customerApi.util.updateQueryData('getCustomerById', id, (draft) => {
              Object.assign(draft as unknown as ICustomer, data);
            })
          );
        } catch {
          // Revert optimistic update on error
          patchResult.undo();
        }
      },
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Customer', id }, 'Customer']
    }),

    patchCustomer: build.mutation({
      query: ({ id, body }) => ({
        url: `customer/${id}`,
        method: 'PATCH',
        body
      }),
      invalidatesTags: ['Customer']
    }),

    deleteCustomer: build.mutation({
      query: (id) => ({
        url: `customer/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Customer']
    }),

    getCustomerHistory: build.query({
      query: (id) => ({
        url: `customer/${id}/history`,
        method: 'GET'
      })
    }),

    createCustomer: build.mutation<ICustomer, ICreateCustomerParams>({
      query: (body) => ({
        url: 'customer/create',
        method: 'POST',
        body
      }),
      invalidatesTags: ['Customer']
    }),
    getCustomerChangeHistory: build.query<IGetCustomerChangeHistoryResponse, IGetCustomerChangeHistoryParams>({
      query: ({ customer_id, ...params }) => ({
        url: `customer/${customer_id}/history`,
        method: 'GET',
        params
      })
    })
  })
});

export const {
  useGetCustomerQuery,
  useLazyGetCustomerQuery,
  useGetAllCustomersQuery,
  useGetCustomerByIdQuery,
  useUpdateCustomerMutation,
  usePatchCustomerMutation,
  useDeleteCustomerMutation,
  useGetCustomerHistoryQuery,
  useCreateCustomerMutation,
  useGetCustomerChangeHistoryQuery
} = customerApi;
