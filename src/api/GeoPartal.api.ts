import { createApi } from '@reduxjs/toolkit/query/react';
import { getBaseQuery } from 'common/helpers';

export interface MapObject {
  id: number;
  request_number: string;
  object_name: string;
  address: string;
  type_ty: string | null;
  status: 'active' | 'inactive' | 'archived';
  stage: 'draft' | 'approved' | 'completed';
  x: number;
  y: number;
}

interface TypeTy {
  title: string;
  id: number;
}

interface ApiMapObject {
  id: number;
  request_number: string;
  object_name: string;
  address: string;
  type_ty: TypeTy | null;
  status: 'active' | 'inactive' | 'archived';
  stage: 'draft' | 'approved' | 'completed';
  x: number;
  y: number;
}

export interface ApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ApiMapObject[];
}

export interface TransformedApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: MapObject[];
}

// Границы для Кыргызстана/региона Бишкека
const KYRGYZSTAN_BOUNDS = {
  minLat: 39.0, // Минимальная широта
  maxLat: 43.5, // Максимальная широта
  minLon: 69.0, // Минимальная долгота
  maxLon: 81.0 // Максимальная долгота
};

const isValidCoordinates = (x: number, y: number): boolean => {
  // Базовая проверка на тип и NaN
  if (typeof x !== 'number' || typeof y !== 'number' || Number.isNaN(x) || Number.isNaN(y)) {
    return false;
  }

  // Проверка на нулевые координаты
  if (x === 0 && y === 0) {
    return false;
  }
  const isLatitudeValid = x >= KYRGYZSTAN_BOUNDS.minLat && x <= KYRGYZSTAN_BOUNDS.maxLat;
  const isLongitudeValid = y >= KYRGYZSTAN_BOUNDS.minLon && y <= KYRGYZSTAN_BOUNDS.maxLon;

  return isLatitudeValid && isLongitudeValid;
};

// Вспомогательная функция для детального описания ошибки валидации
const getValidationError = (x: number, y: number): string => {
  if (typeof x !== 'number' || typeof y !== 'number') {
    return 'Координаты не являются числами';
  }

  if (Number.isNaN(x) || Number.isNaN(y)) {
    return 'Координаты содержат NaN';
  }

  if (x === 0 && y === 0) {
    return 'Нулевые координаты';
  }

  if (x < KYRGYZSTAN_BOUNDS.minLat || x > KYRGYZSTAN_BOUNDS.maxLat) {
    return `Широта вне допустимых границ (${KYRGYZSTAN_BOUNDS.minLat} - ${KYRGYZSTAN_BOUNDS.maxLat})`;
  }

  if (y < KYRGYZSTAN_BOUNDS.minLon || y > KYRGYZSTAN_BOUNDS.maxLon) {
    return `Долгота вне допустимых границ (${KYRGYZSTAN_BOUNDS.minLon} - ${KYRGYZSTAN_BOUNDS.maxLon})`;
  }

  return 'Неизвестная ошибка валидации';
};

export const geoportalApi = createApi({
  reducerPath: 'geoportalApi',
  baseQuery: getBaseQuery(),
  tagTypes: ['MapObject'],
  endpoints: (build) => ({
    getAllMapObjects: build.query<TransformedApiResponse, void>({
      query: () => ({
        url: 'ty/map/',
        method: 'GET',
        params: {
          page_size: 500,
          status: 'active'
        }
      }),
      providesTags: ['MapObject'],
      transformResponse: (response: ApiResponse): TransformedApiResponse => {
        const validResults = response.results
          .filter((obj) => {
            const isValid = isValidCoordinates(obj.x, obj.y);

            if (!isValid) {
              console.warn(`Объект ${obj.id} (${obj.object_name}) имеет невалидные координаты:`, {
                x: obj.x,
                y: obj.y,
                reason: getValidationError(obj.x, obj.y)
              });
            }

            return isValid;
          })
          .map(
            (obj): MapObject => ({
              ...obj,
              type_ty: obj.type_ty ? obj.type_ty.title : null
            })
          );

        console.info(`Отфильтровано объектов: ${response.results.length - validResults.length} из ${response.results.length}`);

        return {
          ...response,
          results: validResults
        };
      }
    })
  })
});

export const { useGetAllMapObjectsQuery } = geoportalApi;
