import { createApi } from '@reduxjs/toolkit/query/react';
import { getBaseQuery } from 'common/helpers';
import type { IDownloadContractDocxParams, IDownloadContractDocxResponse } from 'types/requests';
import type { IGetInvoicesByProtocolTyParams, IGetInvoicesByProtocolTyResponse } from 'types/requests';

export const buhgalteriaApi = createApi({
  reducerPath: 'buhgalteriaApi',
  baseQuery: getBaseQuery(),
  endpoints: (build) => ({
    postProtocol: build.mutation({
      query: ({ protocol_id }) => ({
        url: '/buhgalteria/invoices/generate/' + protocol_id,
        method: 'POST'
      })
    }),
    downloadContractDocx: build.query<IDownloadContractDocxResponse, IDownloadContractDocxParams>({
      query: ({ ty_id, customer_type }) => ({
        url: `/buhgalteria/protocols/${ty_id}/contract-docx/`,
        method: 'GET',
        params: { customer_type },
        headers: {
          Accept: '*/*'
        },
        responseHandler: async (response) => {
          const blob = await response.blob();
          const disposition = response.headers.get('content-disposition') || '';
          let filename: string | null = null;

          // Try RFC 5987 filename*
          const starMatch = /filename\*\s*=\s*[^']+'[^']*'([^;]+)/i.exec(disposition);
          if (starMatch) {
            try {
              filename = decodeURIComponent(starMatch[1]);
            } catch {
              filename = starMatch[1];
            }
          }

          // Fallback to regular filename
          if (!filename) {
            const match = /filename="?([^";]+)"?/i.exec(disposition);
            filename = match ? match[1] : null;
          }

          return { blob, filename };
        }
      }),
      keepUnusedDataFor: 0
    }),
    getInvoicesByProtocolTy: build.query<IGetInvoicesByProtocolTyResponse, IGetInvoicesByProtocolTyParams>({
      query: ({ protocol_id }) => ({
        url: `/buhgalteria/invoices/by_protocol/${protocol_id}/`,
        method: 'GET'
      })
    })
  })
});

export const {
  usePostProtocolMutation,
  useLazyDownloadContractDocxQuery,
  useGetInvoicesByProtocolTyQuery,
  useLazyGetInvoicesByProtocolTyQuery
} = buhgalteriaApi;
