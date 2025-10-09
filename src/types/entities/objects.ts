import { IHistoryType } from 'types/common';

export interface ObjectItem {
  id: number;
  title: string;
  address_street: string;
  address_number: string;
  kadastr_number: string;
  status: string;
  created_at: string;
  updated_at: string;
  customer: number;
  contract_date?: string;
  type?: string;
  usage_type?: string;
  tu_status?: string;
  latitude?: number;
  longitude?: number;
  customer_name?: string;
  full_address?: string;
  creater?: number;
}

export interface ObjectUpdateBody {
  title: string;
  contract_date: string | null;
  type: string;
  status: string;
  address_street: string;
  address_number: string;
  kadastr_number: string;
  usage_type: string;
  tu_status: string;
  latitude: number;
  longitude: number;
  customer: number;
  creater: number;
}

export interface ObjectBody {
  title: string;
  address_street: string;
  address_number: string;
  kadastr_number: string;
  status: string;
  customer: number;
  contract_date?: string;
  type?: string;
  usage_type?: string;
  tu_status?: string;
  latitude?: number;
  longitude?: number;
}

export interface ObjectFilters {
  search: string;
  status: string | null;
  date: string | null;
}

export type ObjectListResponse = ObjectItem[];

export interface ObjectHistoryItem {
  history_user: string;
  history_date: string;
  history_type: string;
}

export type ObjectHistoryResponse = ObjectHistoryItem[];

export interface IObjectChangeHistory {
  history_id?: string;
  history_user?: string;
  history_date: string;
  history_type: IHistoryType;
  history_type_display?: string;
  history_change_reason?: string;
  changes?: { field: string; new: string; old: string }[];
}

export interface IGetObjectParams {
  category?: '0' | '1';
  ordering?: string;
  search?: string;
  status?: 'active' | 'inactive';
  page: number;
  page_size: number;
}
