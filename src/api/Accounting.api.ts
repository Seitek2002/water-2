import { createApi } from '@reduxjs/toolkit/query/react';
import { getBaseQuery } from 'common/helpers';
import {
  IAccountingProtocol,
  IAccountingProtocolsListResponse,
  ICreatePaymentResponse,
  IGenerateInvoiceParams,
  IGenerateInvoiceResponse,
  IGetAccountingProtocolParams,
  IGetAccountingProtocolResponse,
  IGetAccountingProtocolsListParams,
  IGetInvoicesByProtocolParams,
  IGetInvoicesByProtocolResponse,
  IGetInvoicesListParams,
  IGetPaymentsByInvoiceParams,
  IGetPaymentsByInvoiceResponse,
  IPaginatedInvoicesList,
  IUpdateProtocolParams,
  IUpdateProtocolResponse
} from 'types/entities/accounting';

export const accountingApi = createApi({
  reducerPath: 'accountingApi',
  baseQuery: getBaseQuery(),
  tagTypes: ['Invoice', 'Protocol', 'Payment'],
  endpoints: (build) => ({
    getAccountingProtocol: build.query<IGetAccountingProtocolResponse, IGetAccountingProtocolParams>({
      query: ({ technicalConditionId }) => ({
        url: `/buhgalteria/protocolsbyty/${technicalConditionId}/`,
        method: 'GET'
      }),
      providesTags: ['Protocol']
    }),

    getAllProtocols: build.query<IAccountingProtocolsListResponse, IGetAccountingProtocolsListParams>({
      query: (params = {}) => ({
        url: '/buhgalteria/protocols/',
        method: 'GET',
        params
      }),
      providesTags: ['Protocol']
    }),

    // List invoices with filters, ordering and pagination
    getInvoicesList: build.query<IPaginatedInvoicesList, IGetInvoicesListParams>({
      query: (params = {}) => ({
        url: '/buhgalteria/invoices/',
        method: 'GET',
        params
      }),
      providesTags: ['Invoice']
    }),

    // Fetch protocol by ID to resolve its technical_condition for navigation
    getProtocolById: build.query<IAccountingProtocol, { protocolId: string }>({
      query: ({ protocolId }) => ({
        url: `/buhgalteria/protocols/${protocolId}/`,
        method: 'GET'
      }),
      providesTags: ['Protocol']
    }),

    getInvoicesByProtocol: build.query<IGetInvoicesByProtocolResponse, IGetInvoicesByProtocolParams>({
      query: ({ protocolId }) => ({
        url: `/buhgalteria/invoices/by_protocol/${protocolId}/`,
        method: 'GET'
      }),
      providesTags: ['Invoice']
    }),

    generateInvoice: build.mutation<IGenerateInvoiceResponse, IGenerateInvoiceParams>({
      query: ({ protocolId }) => ({
        url: `/buhgalteria/invoices/generate/${protocolId}/`,
        method: 'POST',
        body: {}
      }),
      invalidatesTags: ['Invoice']
    }),

    downloadInvoice: build.query<Blob, { invoiceId: string }>({
      query: ({ invoiceId }) => ({
        url: `/buhgalteria/invoices/dublicate/${invoiceId}/`,
        method: 'GET',
        responseHandler: (response) => response.blob()
      }),
      keepUnusedDataFor: 0
    }),

    updateProtocol: build.mutation<IUpdateProtocolResponse, IUpdateProtocolParams>({
      query: ({ protocolId, body }) => ({
        url: `/buhgalteria/protocols/${protocolId}/`,
        method: 'PUT',
        body
      }),
      invalidatesTags: ['Protocol', 'Invoice']
    }),

    downloadProtocol: build.query<Blob, { technicalConditionId: string }>({
      query: ({ technicalConditionId }) => ({
        url: `/ty/${technicalConditionId}/protocol-excel/`,
        method: 'GET',
        responseHandler: async (response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const blob = await response.blob();

          if (blob.size === 0) {
            throw new Error('Получен пустой файл');
          }

          return blob;
        }
      }),
      keepUnusedDataFor: 0
    }),

    getPaymentsByInvoice: build.query<IGetPaymentsByInvoiceResponse, IGetPaymentsByInvoiceParams>({
      query: ({ invoiceId }) => ({
        url: `/buhgalteria/payments/by_invoice/${invoiceId}/`,
        method: 'GET'
      }),
      providesTags: ['Payment']
    }),

    createPayment: build.mutation<ICreatePaymentResponse, FormData>({
      query: (formData) => ({
        url: `/buhgalteria/payments/`,
        method: 'POST',
        body: formData,
        formData: true
      }),
      invalidatesTags: ['Payment']
    })
  })
});

export const useGetAccountingProtocolQuery = accountingApi.useGetAccountingProtocolQuery;
export const useGetAllProtocolsQuery = accountingApi.useGetAllProtocolsQuery;
export const useGetInvoicesListQuery = accountingApi.useGetInvoicesListQuery;
export const useGetInvoicesByProtocolQuery = accountingApi.useGetInvoicesByProtocolQuery;
export const useGenerateInvoiceMutation = accountingApi.useGenerateInvoiceMutation;
export const useLazyDownloadInvoiceQuery = accountingApi.useLazyDownloadInvoiceQuery;
export const useUpdateProtocolMutation = accountingApi.useUpdateProtocolMutation;
export const useLazyDownloadProtocolQuery = accountingApi.useLazyDownloadProtocolQuery;
export const useGetPaymentsByInvoiceQuery = accountingApi.useGetPaymentsByInvoiceQuery;
export const useCreatePaymentMutation = accountingApi.useCreatePaymentMutation;
export const useLazyGetProtocolByIdQuery = accountingApi.useLazyGetProtocolByIdQuery;
