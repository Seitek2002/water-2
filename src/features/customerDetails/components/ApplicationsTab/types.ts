export type StatusCode = 'approved' | 'rejected';

export interface ApplicationData {
  key: string;
  id: string;
  date: string;
  customer: string;
  address: string;
  objectName: string;
  waterAmount: string;
  wastewaterAmount: string;
  status: StatusCode;
  rejectReason?: string;
  comment?: string;
  ty_id: string;
}
