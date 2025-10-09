// src/api/formula.api.ts

import { createApi } from '@reduxjs/toolkit/query/react';
import { getBaseQuery } from 'common/helpers';
import { FormulaItem, FormulaListResponse, FormulaUpdateBody, IGetFormulasParams } from 'types/entities';

export const formulaApi = createApi({
  reducerPath: 'formulaApi',
  baseQuery: getBaseQuery(),
  tagTypes: ['Formula'],
  endpoints: (build) => ({
    getAllFormulas: build.query<FormulaListResponse, IGetFormulasParams>({
      query: (params) => ({
        url: 'ty/formula/',
        method: 'GET',
        params
      }),
      providesTags: ['Formula']
    }),

    getFormulaById: build.query<FormulaItem, number>({
      query: (id) => ({
        url: `ty/formula/${id}`,
        method: 'GET'
      }),
      providesTags: (_, __, id) => [{ type: 'Formula', id }]
    }),

    createFormula: build.mutation<FormulaItem, Partial<FormulaUpdateBody>>({
      query: (body) => ({
        url: 'ty/formula/create',
        method: 'POST',
        body
      }),
      invalidatesTags: ['Formula']
    }),

    updateFormula: build.mutation<FormulaItem, { id: number; body: FormulaUpdateBody }>({
      query: ({ id, body }) => ({
        url: `ty/formula/update/${id}`,
        method: 'PUT',
        body
      }),
      invalidatesTags: (_, __, { id }) => [{ type: 'Formula', id }, 'Formula']
    }),

    patchFormula: build.mutation<FormulaItem, { id: number; body: Partial<FormulaUpdateBody> }>({
      query: ({ id, body }) => ({
        url: `ty/formula/update/${id}`,
        method: 'PATCH',
        body
      }),
      invalidatesTags: (_, __, { id }) => [{ type: 'Formula', id }, 'Formula']
    }),

    deleteFormula: build.mutation<void, number>({
      query: (id) => ({
        url: `ty/formula/update/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Formula']
    }),

    // Удобный метод для обновления только title
    updateFormulaTitle: build.mutation<FormulaItem, { id: number; title: string }>({
      query: ({ id, title }) => ({
        url: `ty/formula/update/${id}`,
        method: 'PATCH',
        body: { title }
      }),
      invalidatesTags: (_, __, { id }) => [{ type: 'Formula', id }, 'Formula']
    })
  })
});

export const {
  useGetAllFormulasQuery,
  useLazyGetAllFormulasQuery,
  useGetFormulaByIdQuery,
  useCreateFormulaMutation,
  useUpdateFormulaMutation,
  usePatchFormulaMutation,
  useDeleteFormulaMutation,
  useUpdateFormulaTitleMutation
} = formulaApi;
