import { IHistoryType } from 'types/common';

export interface ICustomer {
  id: number;
  full_name: string;
  category: '1' | '0';
  pasport: string;
  address: string;
  contact: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface ICustomerParams {
  category?: 1 | 0;
  ordering?: string;
  search?: string;
  status?: 'active' | 'rejected';
  page: number;
  page_size: number;
}

export interface ICustomerChangeHistory {
  history_user?: string;
  history_date: string;
  history_type: IHistoryType;
}
