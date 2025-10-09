export type StatusCode = 'Активен' | 'Отказано';

export interface IContract {
  name: string;
  contractDate: string;
  type: string;
  status: StatusCode;
}
