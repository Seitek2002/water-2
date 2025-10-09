import { createApi } from '@reduxjs/toolkit/query/react';
import { getBaseQuery } from 'common/helpers';
export interface ImportTyRequest {
  excel_file: File;
}

export interface ImportTyResponse {
  success: boolean;
  message: string;
  created_count: number;
  created_tus: number[];
  errors: string[];
}

export interface ImportProgress {
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  progress: number;
  message?: string;
}

// Создаем API slice
export const tyImportApi = createApi({
  reducerPath: 'tyImportApi',
  baseQuery: getBaseQuery(),
  tagTypes: ['TyImport'],
  endpoints: (builder) => ({
    importTyFromExcel: builder.mutation<ImportTyResponse, File>({
      query: (file) => {
        const formData = new FormData();
        formData.append('excel_file', file);

        return {
          url: 'ty/import/excel/',
          method: 'POST',
          body: formData,
          headers: {}
        };
      },
      invalidatesTags: ['TyImport']
    }),
    getImportTemplate: builder.query<Blob, void>({
      query: () => ({
        url: 'ty/import/template/',
        method: 'GET',
        responseHandler: (response) => response.blob()
      })
    }),

    getImportStats: builder.query<
      {
        total_imports: number;
        successful_imports: number;
        failed_imports: number;
        last_import_date?: string;
      },
      void
    >({
      query: () => ({
        url: 'ty/import/stats/',
        method: 'GET'
      }),
      providesTags: ['TyImport']
    })
  })
});
export const { useImportTyFromExcelMutation, useGetImportTemplateQuery, useGetImportStatsQuery, useLazyGetImportTemplateQuery } =
  tyImportApi;
export const validateExcelFile = (file: File): { isValid: boolean; error?: string } => {
  // Проверяем тип файла
  const validTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];

  if (!validTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Неподдерживаемый формат файла. Загрузите файл .xlsx или .xls'
    };
  }
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'Размер файла слишком большой. Максимальный размер: 10MB'
    };
  }

  return { isValid: true };
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const generateErrorReport = (errors: string[]): string => {
  if (errors.length === 0) return 'Ошибок при импорте не обнаружено.';

  let report = 'Отчет об ошибках импорта:\n\n';
  report += `Дата: ${new Date().toLocaleString('ru-RU')}\n`;
  report += `Всего ошибок: ${errors.length}\n\n`;
  report += '='.repeat(50) + '\n\n';

  errors.forEach((error, index) => {
    report += `${index + 1}. ${error}\n`;
  });

  report += '\n' + '='.repeat(50) + '\n';
  report += 'Рекомендации:\n';
  report += '- Проверьте правильность заполнения обязательных полей\n';
  report += '- Убедитесь в корректности форматов дат и чисел\n';
  report += '- Исправьте ошибки в исходном файле и повторите импорт\n';

  return report;
};

export const downloadErrorReport = (errors: string[], filename: string = 'import_errors.txt'): void => {
  const report = generateErrorReport(errors);
  const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};
