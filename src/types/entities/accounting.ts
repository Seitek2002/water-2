export interface IAccountingProtocol {
  id: number;
  load: string;
  water_price: string;
  kanal_price: string;
  coefficient: number;
  // Основные суммы
  water_sum: string;
  kanal_sum: string;
  total_water_sum: string;
  total_kanal_sum: string;
  // Бумажные работы
  paper_water_sum: string;
  paper_kanal_sum: string;
  // НСП для бумажных работ
  nsp_water_paper: string;
  nsp_kanal_paper: string;
  nsp_paper: string;
  // НДС для бумажных работ
  nds_kanal_paper: string;
  nds_water_paper: string;
  nds_paper: string;
  // Итоговые суммы
  total_sum_main: string;
  total_sum_paper: string;
  // Основные налоги
  nds: string;
  nsp: string;
  nsp_water: string;
  nsp_kanal: string;
  created_at: string;
  technical_condition: number;
}

export interface IGetAccountingProtocolParams {
  technicalConditionId: string;
}

export type IGetAccountingProtocolResponse = IAccountingProtocol;

// Новые типы для списка протоколов
export interface IAccountingProtocolsListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: IAccountingProtocol[];
}

export interface IGetAccountingProtocolsListParams {
  // Pagination and ordering
  page?: number;
  page_size?: number;
  ordering?: string;
  search?: string;

  // Additional filters from API spec
  created_start?: string; // ISO date-time
  created_end?: string; // ISO date-time
  customer_id?: number;
  entity_id?: number;
  has_invoice?: boolean;
  request_number?: string;
  technical_condition_id?: number;
}

export interface IGetInvoicesListParams {
  customer_id?: number;
  entity_id?: number;
  invoice_date_end?: string; // YYYY-MM-DD
  invoice_date_start?: string; // YYYY-MM-DD
  invoice_number?: string;
  invoice_type?: string; // 'main' | 'paper_tu'
  is_paid?: boolean;
  ordering?: string;
  page?: number;
  page_size?: number;
  protocol_id?: number;
  search?: string;
}

export interface IPaginatedInvoicesList {
  count: number;
  next: string | null;
  previous: string | null;
  results: IAccountingInvoice[];
}

export interface IAccountingInvoice {
  id: number;
  invoice_type: 'main' | 'paper_tu';
  pdf_file: string | null;
  invoice_number: string;
  invoice_date: string;
  total_water_sum: string;
  total_kanal_sum: string;
  total_sum: string;
  is_paid: boolean;
  created_at: string;
  protocol: number;
}

export interface IGetInvoicesByProtocolParams {
  protocolId: string;
}

export type IGetInvoicesByProtocolResponse = IAccountingInvoice[];

export interface IGenerateInvoiceParams {
  protocolId: string;
}

export type IGenerateInvoiceResponse = IAccountingInvoice;

export interface IUpdateProtocolParams {
  protocolId: string;
  body: {
    load: string;
    water_price: string;
    kanal_price: string;
    coefficient: number;
    // Основные суммы
    water_sum?: string;
    kanal_sum?: string;
    total_water_sum?: string;
    total_kanal_sum?: string;
    // Бумажные работы
    paper_water_sum?: string;
    paper_kanal_sum?: string;
    // НСП для бумажных работ
    nsp_water_paper?: string;
    nsp_kanal_paper?: string;
    nsp_paper?: string;
    // НДС для бумажных работ
    nds_kanal_paper?: string;
    nds_water_paper?: string;
    nds_paper?: string;
    // Итоговые суммы
    total_sum_main?: string;
    total_sum_paper?: string;
    // Основные налоги
    nds?: string;
    nsp?: string;
    nsp_water?: string;
    nsp_kanal?: string;
    technical_condition: number;
  };
}

export type IUpdateProtocolResponse = IAccountingProtocol;

export interface IDownloadProtocolParams {
  technicalConditionId: string;
}

export interface IPayment {
  id: number;
  payment_number: string;
  payment_date: string;
  amount: string;
  source: string;
  status: 'pending' | 'completed' | 'failed';
  receipt_file: string | null;
  invoice: number;
  created_at: string;
}

export interface IGetPaymentsByInvoiceParams {
  invoiceId: string;
}

export type IGetPaymentsByInvoiceResponse = IPayment[];

export interface ICreatePaymentParams {
  payment_number: string;
  payment_date: string;
  amount: string;
  source: string;
  status: 'pending' | 'completed' | 'failed';
  receipt_file?: string;
  invoice: number;
}

export type ICreatePaymentResponse = IPayment;
