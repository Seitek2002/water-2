import { createApi } from '@reduxjs/toolkit/query/react';
import { getBaseQuery } from 'common/helpers';

interface IUserInfo {
  id: number;
  first_name: string;
  last_name: string;
  phone?: string;
  email: string;
  auth_provider?: string;
  avatar: string;
  is_confirm: boolean;
  allowed_categories: { id: string; title: string }[];
}

interface IUserResponse {
  user: IUserInfo;
}

export interface IUserPermission {
  app_label: string;
  codename: string;
  name: string;
  model: string;
}

export interface IUserPermissionsResponse {
  username: string;
  permissions: IUserPermission[];
}

interface LoginRequest {
  email: string;
  password: string;
}

interface ForgotPasswordRequest {
  email: string;
}

interface ResetPasswordRequest {
  token: string;
  password: string;
}

interface LoginResponse {
  access: string;
  refresh: string;
}

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: getBaseQuery(),
  tagTypes: ['User', 'Permissions'],
  endpoints: (build) => ({
    login: build.mutation<LoginResponse, LoginRequest>({
      query: (data) => ({
        url: '/authentication/token/',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['User', 'Permissions'] // Инвалидируем кеш при логине
    }),

    getUserInfo: build.query<IUserResponse, void>({
      query: () => ({
        url: '/authentication/users/me/',
        method: 'GET'
      }),
      providesTags: ['User'],
      transformResponse: (response: IUserResponse): IUserResponse => {
        // Преобразуем avatar URL если он начинается с /media/
        if (response.user.avatar && response.user.avatar.startsWith('/media/')) {
          const baseUrl = import.meta.env.VITE_API_KEY || 'https://bsv.sino0on.ru/api/v1/';
          const mediaBaseUrl = baseUrl.replace('/api/v1/', '');
          response.user.avatar = `${mediaBaseUrl}${response.user.avatar}`;
        }
        return response;
      }
    }),

    getUserPermissions: build.query<IUserPermissionsResponse, void>({
      query: () => ({
        url: '/authentication/users/permissions/',
        method: 'GET'
      }),
      providesTags: ['Permissions']
    }),
    forgotPassword: build.mutation<unknown, ForgotPasswordRequest>({
      query: (data) => ({
        url: '/authentication/forgot-password/',
        method: 'POST',
        body: data
      })
    }),

    resetPassword: build.mutation<unknown, ResetPasswordRequest>({
      query: (data) => ({
        url: '/authentication/reset-password/',
        method: 'POST',
        body: data
      })
    })
  })
});

export const {
  useForgotPasswordMutation,
  useLoginMutation,
  useResetPasswordMutation,
  useGetUserInfoQuery,
  useGetUserPermissionsQuery,
  useLazyGetUserInfoQuery
} = authApi;

export type { IUserInfo, IUserResponse };
