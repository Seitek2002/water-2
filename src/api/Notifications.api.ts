import { createApi } from '@reduxjs/toolkit/query/react';
import { getBaseQuery } from 'common/helpers';
import type { INotification, INotificationsListResponse } from 'types/entities';

export interface IGetNotificationsParams {
  page?: number;
  page_size?: number;
  ordering?: string;
  type?: string;
  is_read?: boolean;
}

export const notificationsApi = createApi({
  reducerPath: 'notificationsApi',
  baseQuery: getBaseQuery(),
  endpoints: (build) => ({
    // Список уведомлений
    getNotifications: build.query<INotificationsListResponse, IGetNotificationsParams | void>({
      query: (params) => {
        const args: { url: string; method: 'GET'; params?: IGetNotificationsParams } = {
          url: 'notifications/',
          method: 'GET'
        };
        if (params) args.params = params;
        return args;
      }
    }),

    // Детали уведомления
    getNotificationById: build.query<INotification, number | string>({
      query: (id) => ({
        url: `notifications/${id}/`,
        method: 'GET'
      })
    }),

    // Обновление уведомления (например, is_read)
    patchNotification: build.mutation<INotification, { id: number | string; body: Partial<INotification> }>({
      query: ({ id, body }) => ({
        url: `notifications/${id}/`,
        method: 'PATCH',
        body
      })
    }),

    // Отметить одно уведомление как прочитанное (POST-экшн)
    markAsRead: build.mutation<void, number | string>({
      query: (id) => ({
        url: `notifications/${id}/mark-as-read/`,
        method: 'POST'
      })
    }),

    // Отметить все как прочитанные
    markAllAsRead: build.mutation<void, void>({
      query: () => ({
        url: 'notifications/mark-all-as-read/',
        method: 'POST'
      })
    }),

    // Количество непрочитанных
    getUnreadCount: build.query<number | { count?: number; unread?: number }, void>({
      query: () => ({
        url: 'notifications/unread-count/',
        method: 'GET'
      })
    })
  })
});

export const {
  useGetNotificationsQuery,
  useLazyGetNotificationsQuery,
  useGetNotificationByIdQuery,
  usePatchNotificationMutation,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useGetUnreadCountQuery,
  useLazyGetUnreadCountQuery
} = notificationsApi;
