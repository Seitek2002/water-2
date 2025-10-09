import { BaseQueryFn, FetchArgs, fetchBaseQuery, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';

export const getBaseQuery = (): BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> => async (args, api, extraOptions) => {
  const fetchQuery = fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_KEY,
    credentials: 'same-origin',
    prepareHeaders: (headers) => {
      const token = JSON.parse(localStorage.getItem('access_token') || '{}');

      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      if (!headers.has('Accept')) {
        headers.set('Accept', 'application/json');
      }
      return headers;
    }
  });
  const result = await fetchQuery(args, api, extraOptions);

  return result;
};
