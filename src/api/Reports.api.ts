import { createApi } from '@reduxjs/toolkit/query/react';
import { getBaseQuery } from 'common/helpers';
import type { IExportReportsParams, IExportReportsResponse } from 'types/requests';

export type ReportType =
  | 'issued' // Выданные ТУ
  | 'canceled' // Аннулированные ТУ
  | 'not_issued' // Не выданные ТУ
  | 'requests' // Заявки
  | 'land_agreements' // Согласованные участки
  | 'unpaid_tu' // Неоплаченные ТУ
  | 'objects' // Объекты
  | 'payments' // Оплаты
  | 'debts' // Задолженности
  | 'reconciliation'; // Акт сверки

export interface GetReportsQuery {
  created_by?: number;
  ordering?: string;
  page?: number;
  page_size?: number;
  report_type: ReportType;
}

export interface ReportItem {
  id: number;
  report_type: ReportType;
  report_type_display?: string;
  created_at: string;
  title?: string;
  pdf_file?: string; // ссылка на PDF
}

export interface ReportsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ReportItem[];
}

export const reportsApi = createApi({
  reducerPath: 'reportsApi',
  baseQuery: getBaseQuery(),
  endpoints: (build) => ({
    getReports: build.query<ReportsResponse, GetReportsQuery>({
      query: (params) => ({
        url: 'reports/',
        method: 'GET',
        params
      })
    }),

    exportReports: build.mutation<IExportReportsResponse, IExportReportsParams>({
      query: (body) => ({
        url: 'reports/export/',
        method: 'POST',
        body,
        headers: {
          // Server returns binary (PDF/XLSX). Accept any to allow both.
          Accept: 'application/pdf, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/octet-stream, */*'
        },
        responseHandler: async (response) => {
          const blob = await response.blob();
          const disposition = response.headers.get('content-disposition');
          let filename: string | null = null;
          if (disposition) {
            const match = /filename="?([^"]+)"?/.exec(disposition);
            filename = match ? decodeURIComponent(match[1]) : null;
          }
          return { blob, filename };
        }
      })
    })
  })
});

export const { useGetReportsQuery, useLazyGetReportsQuery, useExportReportsMutation } = reportsApi;
