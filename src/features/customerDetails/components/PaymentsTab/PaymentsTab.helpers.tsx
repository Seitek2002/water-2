import { Button, Tag } from 'antd';
import { ColumnsType } from 'antd/es/table';

import i18next from 'i18next';

const { t } = i18next;

type actionType = 'payment';

export interface PaymentData {
  key: string;
  ptuNumber: string;
  customer: string;
  date: string;
  address: string;
  protocol: string;
  status: 'approved' | 'pending';
}
type IGetColumnsFn = (options: { onClick: (record: PaymentData, action: actionType) => void }) => ColumnsType<PaymentData>;

export const getColumns: IGetColumnsFn = ({ onClick }) => {
  return [
    { title: t('historyOfLoads.columns.tu'), dataIndex: 'ptuNumber', key: 'ptuNumber' },
    { title: t('customers.columns.customer'), dataIndex: 'customer', key: 'customer' },
    { title: t('applications.columns.date'), dataIndex: 'date', key: 'date' },
    { title: t('applications.columns.address'), dataIndex: 'address', key: 'address' },
    { title: t('protocolDetail.tabs.protocol'), dataIndex: 'protocol', key: 'protocol' },
    {
      title: t('common.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: 'approved' | 'pending') => (
        <Tag color={status === 'approved' ? 'green' : 'orange'}>
          {status === 'approved' ? t('applications.statusTag.approved') : t('applications.statusTag.pending')}
        </Tag>
      )
    },
    {
      title: t('applications.columns.action'),
      key: 'action',
      render: (_, record: PaymentData) => (
        <Button size='large' type='primary' onClick={() => onClick(record, 'payment')}>
          {t('protocolDetail.invoice.title')}
        </Button>
      )
    }
  ];
};

export const data: PaymentData[] = [
  {
    key: '1',
    ptuNumber: '44-957',
    customer: 'ОССО "Сайрус"',
    date: '03-03-2025',
    address: 'пр. Дон Сайрус, 304',
    protocol: '№ 505155/ЕО',
    status: 'approved'
  },
  {
    key: '2',
    ptuNumber: '44-957',
    customer: 'ОССО "Сайрус"',
    date: '03-03-2025',
    address: 'пр. Дон Сайрус, 304',
    protocol: '№ 505155/ЕО',
    status: 'pending'
  }
];
