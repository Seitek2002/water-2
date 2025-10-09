import { IActEnum, IHistoryType, IStageEnum, IStatus6b3Enum, ITyTypeEnum } from 'types/common';
import { IContractCustomerType } from 'types/requests';

export interface ITechnicalCondition {
  id: number;
  status_display: IStatus6b3Enum;
  stage_display: IStageEnum;
  type?: ITyTypeEnum;
  request_source: string;
  request_number: string;
  request_date: Date;
  object_name: string;
  address: string;
  eni: string;
  status: IStatus6b3Enum;
  sewage_amount: string;
  water_required: string;
  pressure_required: string;
  fire_fighting: string;
  fire_fighting_inner?: string;
  fire_fighting_outer?: string;
  is_water: boolean;
  is_kanal: boolean;
  stage: IStageEnum /** Стадия: 'draft' | 'review' | 'approved' | 'done' */;
  connection_target: string;
  street_pass: string;
  collector: string;
  water_pipe: string;
  sewer: string;

  // Новые поля - Подключение (Водопровод/Канализация/Пожаротушение)
  street_pass_water?: string;
  collector_diametr_water?: string;
  provide_water?: string;

  street_pass_sewer?: string;
  collector_diametr_sewer?: string;
  sewer_pipe?: string;
  provide_sewer?: string;

  street_pass_input_1?: string;
  free_pressure_required_input_1?: string;
  collector_diametr_fire_1?: string;

  street_pass_input_2?: string;
  free_pressure_required_input_2?: string;
  collector_diametr_fire_2?: string;

  fire_input_1: string | null;
  fire_input_2: string | null;
  notes: string | null;
  payment_paper: {
    number: string;
    date: string;
  };
  payment_connection: string;
  payment_status: string;
  payment_amount: string;
  payment_date: string;
  payment_invoice_number: string;
  payment_deadline?: string | Date;
  created_at: string;
  updated_at: string;
  customer: {
    id: string;
    full_name: string;
  };
  entity: number;
  author: number;
  formula: number;
  responsible: number | null;
  application: number | null;
}

export interface IActTy {
  id: number;
  file: string;
  status: IActEnum;
  ty?: number;
}

export interface IGetTyById {
  id: number;
  act?: IActTy | null;
  customer: {
    id: string;
    full_name: string;
    type: IContractCustomerType;
  };
  application?: {
    id: number;
    x: number;
    y: number;
  };
  status_display: IStatus6b3Enum;
  stage_display: IStageEnum;
  request_source: string;
  request_number: string;
  request_date: string | Date;
  object_name: string;
  address: string;
  eni: string;
  type?: ITyTypeEnum;
  status?: IStatus6b3Enum;
  sewage_amount: string;
  water_required: string;
  pressure_required: string;
  fire_fighting: string;
  fire_fighting_inner?: string;
  fire_fighting_outer?: string;
  is_water?: boolean;
  is_kanal?: boolean;
  stage?: IStageEnum;
  connection_target: string;
  street_pass: string;
  collector: string;
  water_pipe: string;
  sewer: string;

  // Новые поля - Подключение (Водопровод/Канализация/Пожаротушение)
  street_pass_water?: string;
  collector_diametr_water?: string;
  provide_water?: string;

  street_pass_sewer?: string;
  collector_diametr_sewer?: string;
  sewer_pipe?: string;
  provide_sewer?: string;

  street_pass_input_1?: string;
  free_pressure_required_input_1?: string;
  collector_diametr_fire_1?: string;

  street_pass_input_2?: string;
  free_pressure_required_input_2?: string;
  collector_diametr_fire_2?: string;

  fire_input_1?: string;
  fire_input_2?: string;
  notes?: string;
  payment_id?: number;
  payment_paper: string;
  payment_connection: string;
  payment_amount: string;
  payment_deadline: Date | string;
  payment_date?: string;
  payment_invoice_number: string;
  created_at: string;
  updated_at: string;
  entity: number;
  author: number;
  formula: number;
  responsible?: number;
  type_ty: {
    id: number;
    title: string;
  } | null;
}

export interface ITyItem {
  id: number;
  status_display: string;
  stage_display: string;
  request_source: string;
  request_number: string;
  request_date: Date;
  object_name: string;
  address: string;
  eni: string;
  status: string;
  sewage_amount: string;
  water_required: string;
  pressure_required: string;
  fire_fighting: string;
  is_water: boolean;
  is_kanal: boolean;
  stage: string;
  connection_target: string;
  street_pass: string;
  collector: string;
  water_pipe: string;
  sewer: string;

  // Новые поля - Подключение (Водопровод/Канализация/Пожаротушение)
  street_pass_water?: string;
  collector_diametr_water?: string;
  provide_water?: string;

  street_pass_sewer?: string;
  collector_diametr_sewer?: string;
  sewer_pipe?: string;
  provide_sewer?: string;

  street_pass_input_1?: string;
  free_pressure_required_input_1?: string;
  collector_diametr_fire_1?: string;

  street_pass_input_2?: string;
  free_pressure_required_input_2?: string;
  collector_diametr_fire_2?: string;

  fire_input_1: string;
  fire_input_2: string;
  notes: string;
  payment_paper: string;
  payment_connection: string;
  payment_status: string;
  payment_amount: string;
  payment_date: string;
  payment_invoice_number: string;
  created_at: string;
  updated_at: string;
  customer: number | string;
  entity: number;
  author: number;
  formula: number;
  responsible: number;
  application: number;
  payment_deadline: Date;
  type_ty: {
    id: number;
    title: string;
  };
}

export interface ITyBody {
  request_source: string;
  request_number: string;
  request_date: Date;
  object_name: string;
  address: string;
  eni: string;
  status: string;
  sewage_amount: string;
  water_required: string;
  pressure_required: string;
  fire_fighting: string;
  is_water: boolean;
  is_kanal: boolean;
  stage: string;
  connection_target: string;
  street_pass: string;
  collector: string;
  water_pipe: string;
  sewer: string;

  // Новые поля - Подключение (Водопровод/Канализация/Пожаротушение)
  street_pass_water?: string;
  collector_diametr_water?: string;
  provide_water?: string;

  street_pass_sewer?: string;
  collector_diametr_sewer?: string;
  sewer_pipe?: string;
  provide_sewer?: string;

  street_pass_input_1?: string;
  free_pressure_required_input_1?: string;
  collector_diametr_fire_1?: string;

  street_pass_input_2?: string;
  free_pressure_required_input_2?: string;
  collector_diametr_fire_2?: string;

  fire_input_1: string;
  fire_input_2: string;
  notes: string;
  payment_paper: string;
  payment_connection: string;
  payment_status: string;
  payment_amount: string;
  payment_date: string;
  payment_invoice_number: string;
  customer: string;
  entity: number;
  formula: number;
  application: number;
  payment_deadline: Date;
}

export interface ITyListQueryParams {
  customer?: number;
  entity?: number;
  formula?: number;
  is_kanal?: boolean;
  is_water?: boolean;
  ordering?: string;
  page?: number;
  page_size?: number;
  search?: string;
  stage?: IStageEnum;
  status?: IStatus6b3Enum;
  type_ty?: number;
  has_invoice?: boolean;
  overdue?: boolean;
  due_in_days?: number;
}

export interface ITypesTY {
  id: number;
  title: string;
}

export interface IHistory {
  history_id: string;
  history_date: string;
  history_user: string;
  history_type: IHistoryType;
  history_type_display: string;
  history_change_reason?: string;
  changes?: { field: string; new: string; old: string }[];
}

export interface IAddLoadParams {
  water_required: string;
  pressure_required: string;
  sewage_amount: string;
  comment?: string;
  files?: File[];
}

export interface ILoadIncreases {
  id: string;
  technical_condition_id: string;
  changes: {
    sewage_amount: {
      new: string;
      old: string;
    };
    water_required: {
      new: string;
      old: string;
    };
    pressure_required: {
      new: string;
      old: string;
    };
  };
  comment?: string;
  created_by?: number;
  created_by_name: string;
  created_at?: string;
  files?: {
    id: string;
    title: string;
    file: File;
  };
}
