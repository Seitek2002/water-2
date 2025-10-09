import { createApi } from '@reduxjs/toolkit/query/react';
import { getBaseQuery } from 'common/helpers';
import type { IFilterPreset, IFilterPresetRequest, IGetPresetsParams, IGetPresetsResponse } from 'types/requests/presets.requests';

export const presetsApi = createApi({
  reducerPath: 'presetsApi',
  baseQuery: getBaseQuery(),
  tagTypes: ['Presets'],
  endpoints: (build) => ({
    getPresets: build.query<IGetPresetsResponse, IGetPresetsParams>({
      query: (params) => ({
        url: '/presets/',
        method: 'GET',
        params
      }),
      providesTags: (result) =>
        result?.results
          ? [...result.results.map((p) => ({ type: 'Presets' as const, id: p.id })), { type: 'Presets' as const, id: 'LIST' }]
          : [{ type: 'Presets' as const, id: 'LIST' }]
    }),

    createPreset: build.mutation<IFilterPreset, IFilterPresetRequest>({
      query: (body) => ({
        url: '/presets/',
        method: 'POST',
        body
      }),
      invalidatesTags: [{ type: 'Presets', id: 'LIST' }]
    }),

    getPresetById: build.query<IFilterPreset, number | string>({
      query: (id) => ({
        url: `/presets/${id}/`,
        method: 'GET'
      }),
      providesTags: (_res, _err, id) => [{ type: 'Presets', id }]
    }),

    updatePreset: build.mutation<IFilterPreset, { id: number | string; body: IFilterPresetRequest }>({
      query: ({ id, body }) => ({
        url: `/presets/${id}/`,
        method: 'PUT',
        body
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: 'Presets', id },
        { type: 'Presets', id: 'LIST' }
      ]
    }),

    patchPreset: build.mutation<IFilterPreset, { id: number | string; body: Partial<IFilterPresetRequest> }>({
      query: ({ id, body }) => ({
        url: `/presets/${id}/`,
        method: 'PATCH',
        body
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: 'Presets', id },
        { type: 'Presets', id: 'LIST' }
      ]
    }),

    deletePreset: build.mutation<void, number | string>({
      query: (id) => ({
        url: `/presets/${id}/`,
        method: 'DELETE'
      }),
      invalidatesTags: (_res, _err, id) => [
        { type: 'Presets', id },
        { type: 'Presets', id: 'LIST' }
      ]
    })
  })
});

export const {
  useGetPresetsQuery,
  useCreatePresetMutation,
  useGetPresetByIdQuery,
  useUpdatePresetMutation,
  usePatchPresetMutation,
  useDeletePresetMutation
} = presetsApi;
