import { IPaginationMeta } from 'types/common';
import { IObjectChangeHistory } from 'types/entities/objects';

export type IGetObjectChangeHistoryResponse = IPaginationMeta & {
  results: IObjectChangeHistory[];
};

export type IGetObjectChangeHistoryParams = {
  object_id: string;
  page?: number;
  page_size?: number;
};
