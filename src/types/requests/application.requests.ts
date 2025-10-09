import { IPaginationMeta } from 'types/common';
import { IApplicationHistory } from 'types/entities';

export interface IApplication {
  status: 'pending' | 'rejected' | 'approved' | 'contracted';
  customer: number | string; // Может быть строка для поиска или ID
  object: string;
  address: string;
  contact: string;
  quantity: string;
  pressure: string;
  waterRequired: string;
  firefightingExpensesInner: string; // Исправлено название поля
  firefightingExpensesOuter: string;
  latitude: number; // Изменено с x на latitude
  longitude: number; // Изменено с y на longitude
  entity: number;
  INN?: string | null; // Добавлено поле INN
}

export interface IGetApplicationsParams {
  status?: 'pending' | 'rejected' | 'approved' | 'contracted';
  search?: string;
  customer?: number;
  entity?: number;
  ordering?: string;
  page?: number;
  page_size?: number;
}

export interface IGetApplicationHistoryParams {
  application_id: string;
  page?: number;
  page_size?: number;
}

export type IGetApplicationHistoryResponse = IPaginationMeta & {
  results: IApplicationHistory[];
};
