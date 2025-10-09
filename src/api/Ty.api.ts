import { createApi } from '@reduxjs/toolkit/query/react';
import { getBaseQuery } from 'common/helpers';
import type {
  IActTyResponse,
  IAddLoadParams,
  ICreateActTyParams,
  ICreateTechnicalConditionParams,
  ICreateTechnicalConditionRequest,
  IDeleteTechnicalConditionParams,
  IDeleteTechnicalConditionResponse,
  IDownloadTyPdfParams,
  IDownloadTyPdfResponse,
  IForkMinimalParams,
  IForkMinimalResponse,
  IGetAllTechnicalConditionParams,
  IGetAllTechnicalConditionResponse,
  IGetLoadIncreasesParams,
  IGetLoadIncreasesResponse,
  IGetTechnicalConditionByIdParams,
  IGetTechnicalConditionByIdResponse,
  IGetTyHistoryParams,
  IGetTyHistoryResponse,
  IITypesTYParams,
  IPatchActTyParams,
  IPatchTechnicalConditionParams,
  IPatchTechnicalConditionResponse,
  IProtocolDocxParams,
  IProtocolDocxResponse,
  ITypesTYResponse,
  IUpdateTechnicalConditionParams,
  IUpdateTechnicalConditionResponse
} from 'types/requests';

export const tyApi = createApi({
  reducerPath: 'tyApi',
  baseQuery: getBaseQuery(),
  tagTypes: ['Ty', 'TyLoads'],
  endpoints: (build) => ({
    getAllTy: build.query<IGetAllTechnicalConditionResponse, IGetAllTechnicalConditionParams>({
      query: (params) => ({
        url: '/ty/',
        method: 'GET',
        params
      }),
      providesTags: ['Ty']
    }),

    createTy: build.mutation<ICreateTechnicalConditionRequest, ICreateTechnicalConditionParams>({
      query: (body) => ({
        url: '/ty/',
        method: 'POST',
        body
      }),
      invalidatesTags: ['Ty']
    }),

    getTyById: build.query<IGetTechnicalConditionByIdResponse, IGetTechnicalConditionByIdParams>({
      query: ({ tyId }) => ({
        url: `/ty/${tyId}/`,
        method: 'GET'
      }),
      providesTags: (_result, _error, { tyId }) => [{ type: 'Ty', id: tyId }]
    }),

    updateTy: build.mutation<IUpdateTechnicalConditionResponse, IUpdateTechnicalConditionParams>({
      query: ({ id, body }) => ({
        url: `/ty/${id}/`,
        method: 'PUT',
        body
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Ty', id }]
    }),

    patchTy: build.mutation<IPatchTechnicalConditionResponse, IPatchTechnicalConditionParams>({
      query: ({ id, body }) => ({
        url: `/ty/${id}/`,
        method: 'PATCH',
        body
      }),
      invalidatesTags: ['Ty']
    }),

    deleteTy: build.mutation<IDeleteTechnicalConditionResponse, IDeleteTechnicalConditionParams>({
      query: (id) => ({
        url: `/ty/${id}/`,
        method: 'DELETE'
      })
    }),
    getTypesTy: build.query<ITypesTYResponse, IITypesTYParams>({
      query: () => ({
        url: '/ty/typesTY/',
        method: 'GET'
      })
    }),
    getHistoryTy: build.query<IGetTyHistoryResponse, IGetTyHistoryParams>({
      query: ({ tyId, ...params }) => ({
        url: `/ty/${tyId}/history/`,
        method: 'GET',
        params
      })
    }),
    createTyFromApplication: build.mutation<void, { application_id: number }>({
      query: ({ application_id }) => ({
        url: `/ty/from-application/${application_id}/`,
        method: 'POST'
      })
    }),
    addLoad: build.mutation<void, IAddLoadParams>({
      query: ({ ty_id, water_required, pressure_required, sewage_amount, comment, files }) => {
        const formData = new FormData();
        formData.append('water_required', water_required);
        formData.append('pressure_required', pressure_required);
        formData.append('sewage_amount', sewage_amount);
        if (comment) formData.append('comment', comment);
        if (files && files.length) {
          files.forEach((file) => formData.append('files', file));
        }
        return {
          url: `/ty/${ty_id}/add-load/`,
          method: 'PATCH',
          body: formData,
          formData: true
        };
      },
      invalidatesTags: (_result, _error, { ty_id }) => [{ type: 'Ty', id: ty_id }]
    }),

    forkMinimal: build.mutation<IForkMinimalResponse, IForkMinimalParams>({
      query: ({ id, water_required, pressure_required, sewage_amount, comment, files, ...rest }) => {
        if (files && files.length) {
          const formData = new FormData();
          formData.append('water_required', String(water_required));
          formData.append('pressure_required', String(pressure_required));
          formData.append('sewage_amount', String(sewage_amount));
          if (comment) formData.append('comment', comment);

          // Append optional extras supported by TechnicalConditionBaseRequest
          Object.entries(rest).forEach(([key, value]) => {
            if (value === undefined || value === null) return;
            formData.append(key, typeof value === 'number' || typeof value === 'boolean' ? String(value) : (value as string));
          });

          files.forEach((file) => formData.append('files', file));
          return {
            url: `/ty/technical-conditions/${id}/fork_minimal/`,
            method: 'POST',
            body: formData,
            formData: true
          };
        }
        return {
          url: `/ty/technical-conditions/${id}/fork_minimal/`,
          method: 'POST',
          body: {
            water_required,
            pressure_required,
            sewage_amount,
            ...(comment ? { comment } : {}),
            ...rest
          }
        };
      },
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Ty', id },
        { type: 'TyLoads', id }
      ]
    }),

    getLoadIncreases: build.query<IGetLoadIncreasesResponse, IGetLoadIncreasesParams>({
      query: ({ tyId }) => ({
        url: `/ty/${tyId}/load-increases/`,
        method: 'GET'
      }),
      providesTags: (_result, _error, { tyId }) => [{ type: 'TyLoads', id: tyId }]
    }),
    downloadTyPdf: build.query<IDownloadTyPdfResponse, IDownloadTyPdfParams>({
      query: ({ tyId }) => ({
        url: `/ty/${tyId}/protocol-pdf/`,
        method: 'GET',
        headers: {
          Accept: '*/*'
        },
        responseHandler: async (response) => {
          const blob = await response.blob();
          const disposition = response.headers.get('content-disposition') || '';
          let filename: string | null = null;

          // Try RFC 5987 filename* first (e.g., filename*=UTF-8''encoded%20name.pdf)
          const starMatch = /filename\*\s*=\s*[^']+'[^']*'([^;]+)/i.exec(disposition);
          if (starMatch) {
            try {
              filename = decodeURIComponent(starMatch[1]);
            } catch {
              filename = starMatch[1];
            }
          }

          // Fallback to regular filename="name.pdf"
          if (!filename) {
            const match = /filename="?([^";]+)"?/i.exec(disposition);
            filename = match ? match[1] : null;
          }

          return { blob, filename };
        }
      }),
      keepUnusedDataFor: 0
    }),
    downloadProtocolDocx: build.query<IProtocolDocxResponse, IProtocolDocxParams>({
      query: ({ tyId }) => ({
        url: `/ty/${tyId}/protocol-docx/`,
        method: 'GET',
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
    getActTyById: build.query<IActTyResponse, { id: string | number }>({
      query: ({ id }) => ({
        url: `/ty/act_ty/${id}`,
        method: 'GET'
      })
    }),
    // ACT TY: create (POST) and patch (PATCH)
    createActTy: build.mutation<IActTyResponse, ICreateActTyParams>({
      query: (body) => {
        if (body.file && body.file instanceof File) {
          const formData = new FormData();
          formData.append('ty', String(body.ty));
          if (body.status) formData.append('status', body.status);
          formData.append('file', body.file);
          return {
            url: `/ty/act_ty/`,
            method: 'POST',
            body: formData,
            formData: true
          };
        }
        return {
          url: `/ty/act_ty/`,
          method: 'POST',
          body: {
            ty: typeof body.ty === 'string' ? Number(body.ty) : body.ty,
            ...(body.status ? { status: body.status } : {}),
            ...(body.file ? { file: body.file } : {})
          }
        };
      },
      invalidatesTags: (_result, _error, body) => [{ type: 'Ty', id: String(body.ty) }, 'Ty']
    }),
    patchActTy: build.mutation<IActTyResponse, IPatchActTyParams>({
      query: ({ id, body }) => ({
        url: `/ty/act_ty/${id}`,
        method: 'PATCH',
        body
      }),
      invalidatesTags: (result) => (result ? [{ type: 'Ty', id: String(result.ty) }, 'Ty'] : ['Ty'])
    })
  })
});

export const {
  useGetAllTyQuery,
  useCreateTyMutation,
  useGetTyByIdQuery,
  useUpdateTyMutation,
  usePatchTyMutation,
  useDeleteTyMutation,
  useGetTypesTyQuery,
  useGetHistoryTyQuery,
  useCreateTyFromApplicationMutation,
  useAddLoadMutation,
  useForkMinimalMutation,
  useGetLoadIncreasesQuery,
  useLazyDownloadTyPdfQuery,
  useLazyDownloadProtocolDocxQuery,
  useCreateActTyMutation,
  usePatchActTyMutation,
  useLazyGetActTyByIdQuery
} = tyApi;
