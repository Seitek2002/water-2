import { IActEnum, IPaginationMeta } from 'types/common';
import { IGetTyById, IHistory, ILoadIncreases, ITechnicalCondition, ITyBody, ITyItem, ITyListQueryParams, ITypesTY } from 'types/entities';

export type IGetAllTechnicalConditionResponse = IPaginationMeta & {
  results: ITechnicalCondition[];
};
export type IGetAllTechnicalConditionParams = ITyListQueryParams;

export type ICreateTechnicalConditionRequest = ITyItem;
export type ICreateTechnicalConditionParams = Omit<ITyBody, 'request_date' | 'payment_deadline'> & {
  request_date: string;
  payment_deadline: string;
};

export type IGetTechnicalConditionByIdParams = { tyId: string };
export type IGetTechnicalConditionByIdResponse = IGetTyById;

export interface IUpdateTechnicalConditionParams {
  id: string;
  body: ITyBody;
}
export type IUpdateTechnicalConditionResponse = ITyItem;

export interface IPatchTechnicalConditionParams {
  id: number;
  body: Partial<ITyBody>;
}
export type IPatchTechnicalConditionResponse = ITyItem;

export type IDeleteTechnicalConditionParams = number;
export type IDeleteTechnicalConditionResponse = void;

export type ITypesTYResponse = ITypesTY[];
export type IITypesTYParams = void;

export type IGetTyHistoryResponse = IPaginationMeta & {
  results: IHistory[];
};
export type IGetTyHistoryParams = { tyId: string; page?: number; page_size?: number };

export interface IAddLoadParams {
  ty_id: string;
  water_required: string;
  pressure_required: string;
  sewage_amount: string;
  comment?: string;
  files?: File[];
}

export type IGetLoadIncreasesResponse = ILoadIncreases[];
export type IGetLoadIncreasesParams = { tyId: string };

export interface IForkMinimalParams {
  id: string;
  water_required?: string;
  pressure_required?: number;
  sewage_amount?: string;

  // Optional extras supported by TechnicalConditionBaseRequest
  fire_fighting_inner?: string;
  fire_fighting_outer?: string;

  fire_input_1?: string;
  street_pass_input_1?: string;
  free_pressure_required_input_1?: number;
  collector_diametr_fire_1?: string;

  fire_input_2?: string;
  street_pass_input_2?: string;
  free_pressure_required_input_2?: number;
  collector_diametr_fire_2?: string;

  connection_target?: string;

  // Water connection
  collector_diametr_water?: string;
  water_pipe?: string;
  street_pass_water?: string;
  provide_water?: string;

  // Sewer connection
  collector_diametr_sewer?: string;
  sewer_pipe?: string;
  street_pass_sewer?: string;
  provide_sewer?: string;

  // Flags
  is_water?: boolean;
  is_kanal?: boolean;

  // Meta
  comment?: string;
  files?: File[];
}
export type IForkMinimalResponse = ITechnicalCondition;

export type IDownloadTyPdfResponse = { blob: Blob; filename: string | null };
export type IDownloadTyPdfParams = { tyId: string };

export type IProtocolDocxResponse = { blob: Blob; filename: string | null };
export type IProtocolDocxParams = { tyId: string };

export interface ICreateActTyParams {
  ty: number | string;
  status?: IActEnum;
  file?: File | string;
}

export interface IActTyResponse {
  id: number;
  file: string;
  status: IActEnum;
  ty: number;
}

/**
 * PATCH act_ty: id must be the ACT id (not TU id). Body includes ONLY status (no file).
 */
export interface IPatchActTyParams {
  id: number | string; // ACT id
  body: {
    status: IActEnum;
  };
}
