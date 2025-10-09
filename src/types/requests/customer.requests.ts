import { IPaginationMeta } from 'types/common';
import { ICustomer, ICustomerChangeHistory, ICustomerParams } from 'types/entities';

export type IGetCustomerResponse = IPaginationMeta & {
  results: ICustomer[];
};

export type IGetCustomerParams = ICustomerParams;

export type IGetCustomerChangeHistoryResponse = IPaginationMeta & {
  results: ICustomerChangeHistory[];
};

export type IGetCustomerChangeHistoryParams = {
  customer_id: string;
  page?: number;
  page_size?: number;
};
