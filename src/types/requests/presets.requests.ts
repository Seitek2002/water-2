import { IPaginationMeta } from 'types/common';

export type PresetTarget = 'ty' | string;

export interface IFilterPreset {
  id: number;
  name: string;
  description?: string | null;
  target: PresetTarget;
  /**
   * Сериализованные параметры фильтров (query-параметры), например: "search=abc&status=active&ordering=-created_at"
   */
  query_string: string;
  created_at?: string;
  updated_at?: string;
}

export interface IFilterPresetRequest {
  name: string;
  description?: string | null;
  target: PresetTarget;
  /**
   * Содержимое query-параметров для применения фильтров
   */
  query_string: string;
}

export type IGetPresetsParams = {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
  target?: PresetTarget;
};

export type IGetPresetsResponse = IPaginationMeta & {
  results: IFilterPreset[];
};
