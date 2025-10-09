import { createApi } from '@reduxjs/toolkit/query/react';
import { getBaseQuery } from 'common/helpers';

type FormatType = 'json' | 'yaml';
type LangType = 'ky' | 'ru';

interface GetDocsQueryParams {
  format?: FormatType;
  lang?: LangType;
}

interface DocsResponse {
  additionalProp1: string;
  additionalProp2: string;
  additionalProp3: string;
}

export const docsApi = createApi({
  reducerPath: 'docsApi',
  baseQuery: getBaseQuery(),
  endpoints: (build) => ({
    getDocs: build.query<DocsResponse, GetDocsQueryParams>({
      query: ({ format, lang } = {}) => ({
        url: 'docs/',
        method: 'GET',
        params: { format, lang }
      })
    })
  })
});

export const { useGetDocsQuery } = docsApi;
