import type { ExportEntity } from 'types/entities/reports.entities';

import { t } from 'i18next';

export type FieldType = 'number' | 'string' | 'date' | 'boolean' | 'select';

export interface FieldConfig {
  name:
    | 'id'
    | 'request_number'
    | 'status'
    | 'stage'
    | 'type_ty'
    | 'customer_id'
    | 'entity_id'
    | 'formula_id'
    | 'request_date_start'
    | 'request_date_end'
    | 'is_water'
    | 'is_kanal'
    | 'created_start'
    | 'created_end'
    | 'technical_condition_id'
    | 'inn'
    | 'full_name'
    | 'invoice_id'
    | 'payment_number'
    | 'payment_date_start'
    | 'payment_date_end'
    | 'invoice_number'
    | 'is_paid'
    | 'protocol_id'
    | 'invoice_type'
    | 'invoice_date_start'
    | 'invoice_date_end';
  label: string;
  type: FieldType;
  options?: { value: string; label: string }[];
}

export type FormValues = {
  export?: 'pdf' | 'xlsx';
  entity?: ExportEntity;
  filters?: Record<string, unknown>;
  ids?: (string | number)[];
  include?: {
    customer?: boolean;
    entity?: boolean;
    protocol?: boolean;
    invoices?: boolean;
    payments?: boolean;
  };
  include_pending?: boolean;
  fields?: string[];
  filename?: string;
};

export const EXPORT_FORMAT_OPTIONS: { value: 'pdf' | 'xlsx'; label: string }[] = [
  { value: 'pdf', label: t('exportData.config.formatOptions.pdf') },
  { value: 'xlsx', label: t('exportData.config.formatOptions.xlsx') }
];

export const EXPORT_ENTITY_OPTIONS: { value: ExportEntity; label: string }[] = [
  { value: 'technical_conditions', label: t('exportData.config.entityOptions.technical_conditions') },
  { value: 'entities', label: t('exportData.config.entityOptions.entities') },
  { value: 'protocols', label: t('exportData.config.entityOptions.protocols') },
  { value: 'customers', label: t('exportData.config.entityOptions.customers') },
  { value: 'payments', label: t('exportData.config.entityOptions.payments') },
  { value: 'invoices', label: t('exportData.config.entityOptions.invoices') },
  { value: 'applications', label: t('exportData.config.entityOptions.applications') }
];

const STATUS6B3_OPTIONS = [
  { value: 'active', label: t('exportData.config.statusOptions.active') },
  { value: 'inactive', label: t('exportData.config.statusOptions.inactive') },
  { value: 'archived', label: t('exportData.config.statusOptions.archived') }
];

const STAGE_OPTIONS = [
  { value: 'draft', label: t('exportData.config.stageOptions.draft') },
  { value: 'review', label: t('exportData.config.stageOptions.review') },
  { value: 'approved', label: t('exportData.config.stageOptions.approved') },
  { value: 'done', label: t('exportData.config.stageOptions.done') }
];

const CUSTOMER_STATUS_OPTIONS = [
  { value: 'active', label: t('exportData.config.customerStatusOptions.active') },
  { value: 'rejected', label: t('exportData.config.customerStatusOptions.rejected') }
];

const PAYMENT_STATUS_OPTIONS = [
  { value: 'pending', label: t('exportData.config.paymentStatusOptions.pending') },
  { value: 'received', label: t('exportData.config.paymentStatusOptions.received') }
];

const INVOICE_TYPE_OPTIONS = [
  { value: 'main', label: t('exportData.config.invoiceTypeOptions.main') },
  { value: 'paper_tu', label: t('exportData.config.invoiceTypeOptions.paper_tu') }
];

const APPLICATION_STATUS_OPTIONS = [
  { value: 'pending', label: t('exportData.config.applicationStatusOptions.pending') },
  { value: 'rejected', label: t('exportData.config.applicationStatusOptions.rejected') },
  { value: 'approved', label: t('exportData.config.applicationStatusOptions.approved') },
  { value: 'contracted', label: t('exportData.config.applicationStatusOptions.contracted') }
];

// Полный перечень фильтров по сущностям (из OpenAPI)
export const FILTER_CONFIG: Record<ExportEntity, FieldConfig[]> = {
  technical_conditions: [
    { name: 'id', label: t('exportData.filters.id'), type: 'number' },
    { name: 'request_number', label: t('exportData.filters.request_number'), type: 'string' },
    { name: 'status', label: t('exportData.filters.status'), type: 'select', options: STATUS6B3_OPTIONS },
    { name: 'stage', label: t('exportData.filters.stage'), type: 'select', options: STAGE_OPTIONS },
    { name: 'type_ty', label: t('exportData.filters.type_ty'), type: 'number' },
    { name: 'customer_id', label: t('exportData.filters.customer_id'), type: 'number' },
    { name: 'entity_id', label: t('exportData.filters.entity_id'), type: 'number' },
    { name: 'formula_id', label: t('exportData.filters.formula_id'), type: 'number' },
    { name: 'request_date_start', label: t('exportData.filters.request_date_start'), type: 'date' },
    { name: 'request_date_end', label: t('exportData.filters.request_date_end'), type: 'date' },
    { name: 'is_water', label: t('exportData.filters.is_water'), type: 'boolean' },
    { name: 'is_kanal', label: t('exportData.filters.is_kanal'), type: 'boolean' }
  ],
  entities: [
    { name: 'id', label: t('exportData.filters.id'), type: 'number' },
    { name: 'status', label: t('exportData.filters.status'), type: 'select', options: STATUS6B3_OPTIONS },
    { name: 'customer_id', label: t('exportData.filters.customer_id'), type: 'number' },
    { name: 'created_start', label: t('exportData.filters.created_start'), type: 'date' },
    { name: 'created_end', label: t('exportData.filters.created_end'), type: 'date' }
  ],
  protocols: [
    { name: 'id', label: t('exportData.filters.id'), type: 'number' },
    { name: 'technical_condition_id', label: t('exportData.filters.technical_condition_id'), type: 'number' },
    { name: 'created_start', label: t('exportData.filters.created_start'), type: 'date' },
    { name: 'created_end', label: t('exportData.filters.created_end'), type: 'date' }
  ],
  customers: [
    { name: 'id', label: t('exportData.filters.id'), type: 'number' },
    { name: 'inn', label: t('exportData.filters.inn'), type: 'string' },
    { name: 'full_name', label: t('exportData.filters.full_name'), type: 'string' },
    { name: 'status', label: t('exportData.filters.status'), type: 'select', options: CUSTOMER_STATUS_OPTIONS },
    { name: 'created_start', label: t('exportData.filters.created_start'), type: 'date' },
    { name: 'created_end', label: t('exportData.filters.created_end'), type: 'date' }
  ],
  payments: [
    { name: 'id', label: t('exportData.filters.id'), type: 'number' },
    { name: 'status', label: t('exportData.filters.status'), type: 'select', options: PAYMENT_STATUS_OPTIONS },
    { name: 'invoice_id', label: t('exportData.filters.invoice_id'), type: 'number' },
    { name: 'payment_number', label: t('exportData.filters.payment_number'), type: 'string' },
    { name: 'payment_date_start', label: t('exportData.filters.payment_date_start'), type: 'date' },
    { name: 'payment_date_end', label: t('exportData.filters.payment_date_end'), type: 'date' }
  ],
  invoices: [
    { name: 'id', label: t('exportData.filters.id'), type: 'number' },
    { name: 'invoice_number', label: t('exportData.filters.invoice_number'), type: 'string' },
    { name: 'is_paid', label: t('exportData.filters.is_paid'), type: 'boolean' },
    { name: 'protocol_id', label: t('exportData.filters.protocol_id'), type: 'number' },
    { name: 'invoice_type', label: t('exportData.filters.invoice_type'), type: 'select', options: INVOICE_TYPE_OPTIONS },
    { name: 'invoice_date_start', label: t('exportData.filters.invoice_date_start'), type: 'date' },
    { name: 'invoice_date_end', label: t('exportData.filters.invoice_date_end'), type: 'date' }
  ],
  applications: [
    { name: 'id', label: t('exportData.filters.id'), type: 'number' },
    { name: 'status', label: t('exportData.filters.status'), type: 'select', options: APPLICATION_STATUS_OPTIONS },
    { name: 'customer_id', label: t('exportData.filters.customer_id'), type: 'number' },
    { name: 'entity_id', label: t('exportData.filters.entity_id'), type: 'number' },
    { name: 'created_start', label: t('exportData.filters.created_start'), type: 'date' },
    { name: 'created_end', label: t('exportData.filters.created_end'), type: 'date' }
  ]
};

function hasFormat(v: unknown): v is { format: (fmt: string) => string } {
  return typeof v === 'object' && v !== null && 'format' in v && typeof (v as { format?: unknown }).format === 'function';
}

export const prepareFilters = (filters?: Record<string, unknown>) => {
  if (!filters) return undefined;
  const prepared = Object.entries(filters).reduce<Record<string, unknown>>((acc, [k, v]) => {
    if (v === undefined || v === null || v === '') return acc;
    acc[k] = hasFormat(v) ? v.format('YYYY-MM-DD') : v;
    return acc;
  }, {});
  return Object.keys(prepared).length ? prepared : undefined;
};

export const prepareIds = (ids?: (string | number)[]) => {
  if (!ids || !ids.length) return undefined;
  const out = ids
    .map((v) => (typeof v === 'string' ? v.trim() : v))
    .filter(Boolean)
    .map((v) => Number(v))
    .filter((n) => !Number.isNaN(n));
  return out.length ? out : undefined;
};

export const isIncludePendingVisible = (entity?: ExportEntity) => entity === 'payments' || entity === 'invoices';

export const handleDownload = (blob: Blob, preferredName: string | null, entity: string, fmt: 'pdf' | 'xlsx', filename?: string) => {
  const ext = fmt === 'pdf' ? 'pdf' : 'xlsx';
  const defaultBase = filename || `${entity}_${new Date().toISOString().slice(0, 10)}`;
  const finalName = preferredName || `${defaultBase}.${ext}`;

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = finalName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};
