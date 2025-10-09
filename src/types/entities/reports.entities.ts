/**
 * Entities & enums for unified export endpoint (/reports/export/)
 */

export type ExportFormat = 'pdf' | 'xlsx';

export type ExportEntity = 'technical_conditions' | 'entities' | 'protocols' | 'customers' | 'payments' | 'invoices' | 'applications';

export interface ExportInclude {
  customer?: boolean;
  entity?: boolean;
  protocol?: boolean;
  invoices?: boolean;
  payments?: boolean;
}

/**
 * Common enums as per OpenAPI
 */
export type StageEnum = 'draft' | 'review' | 'approved' | 'done';
export type Status6b3Enum = 'active' | 'inactive' | 'archived';
export type CustomerStatusEnum = 'active' | 'rejected';
export type ApplicationStatusEnum = 'pending' | 'rejected' | 'approved' | 'contracted';
export type PaymentStatusEnum = 'pending' | 'received';
export type InvoiceTypeEnum = 'main' | 'paper_tu';

/**
 * Filter types by entity (dates are ISO YYYY-MM-DD)
 */
export interface TechnicalConditionsExportFilters {
  id?: number;
  request_number?: string;
  status?: Status6b3Enum;
  stage?: StageEnum;
  type_ty?: number;
  customer_id?: number;
  entity_id?: number;
  formula_id?: number;
  request_date_start?: string;
  request_date_end?: string;
  is_water?: boolean;
  is_kanal?: boolean;
}

export interface EntitiesExportFilters {
  id?: number;
  status?: Status6b3Enum;
  customer_id?: number;
  created_start?: string;
  created_end?: string;
}

export interface ProtocolsExportFilters {
  id?: number;
  technical_condition_id?: number;
  created_start?: string;
  created_end?: string;
}

export interface CustomersExportFilters {
  id?: number;
  inn?: string;
  full_name?: string;
  status?: CustomerStatusEnum;
  created_start?: string;
  created_end?: string;
}

export interface PaymentsExportFilters {
  id?: number;
  status?: PaymentStatusEnum;
  invoice_id?: number;
  payment_number?: string;
  payment_date_start?: string;
  payment_date_end?: string;
}

export interface InvoicesExportFilters {
  id?: number;
  invoice_number?: string;
  is_paid?: boolean;
  protocol_id?: number;
  invoice_type?: InvoiceTypeEnum;
  invoice_date_start?: string;
  invoice_date_end?: string;
}

export interface ApplicationsExportFilters {
  id?: number;
  status?: ApplicationStatusEnum;
  customer_id?: number;
  entity_id?: number;
  created_start?: string;
  created_end?: string;
}

export type ExportFilters =
  | TechnicalConditionsExportFilters
  | EntitiesExportFilters
  | ProtocolsExportFilters
  | CustomersExportFilters
  | PaymentsExportFilters
  | InvoicesExportFilters
  | ApplicationsExportFilters;
