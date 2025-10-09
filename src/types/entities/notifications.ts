export interface INotification {
  id: number;
  type: 'tu_created' | 'application_created' | string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string; // ISO datetime
  application_id: number | null;
  technical_condition_id: number | null;
  extra_data: {
    author?: string;
    object_name?: string;
    customer_name?: string | null;
    request_number?: string;
    address?: string;
  } | null;
}

export interface INotificationsListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: INotification[];
}
