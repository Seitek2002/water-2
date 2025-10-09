import { IHistoryType } from 'types/common';
import type { IApplication } from 'types/requests';

export interface IApplicationResponse {
  id: number;
  status: 'pending' | 'rejected' | 'approved' | 'contracted';
  customer: {
    id: number;
    full_name: string;
  };
  object: string;
  address: string;
  contact: string;
  quantity: string;
  pressure: string;
  waterRequired: string;
  firefightingExpenses: string;
  latitude: number;
  longitude: number;
  application_files: string[];
  entity: number;
  created_at: string;
  updated_at: string;
  ty_id?: string;
}

export interface IApplicationsListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: IApplicationResponse[];
}

export interface ICreateApplicationResponse extends IApplication {
  id: number;
  created_at: string;
  updated_at: string;
}

export interface IApplicationHistory {
  history_id: string;
  history_date: string;
  history_user: string;
  history_type: IHistoryType;
  history_type_display: string;
  history_change_reason?: string;
  changes?: { field: string; new: string; old: string }[];
  files_as_of: string[];
  files_added: string[];
}
