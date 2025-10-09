import { Button, Flex, TabsProps, Tag } from 'antd';
import { ColumnsType } from 'antd/es/table';

import i18next from 'i18next';

export type actionType = 'create' | 'reject' | 'approve' | 'tuDetails' | 'applicationView' | 'customerView';

export const tabItems: TabsProps['items'] = [
  { key: 'all', label: i18next.t('applications.tabs.all'), children: null },
  { key: 'accepted', label: i18next.t('applications.tabs.accepted'), children: null },
  { key: 'pending', label: i18next.t('applications.tabs.pending'), children: null },
  { key: 'rejected', label: i18next.t('applications.tabs.rejected'), children: null }
];

export type StatusCode = 'approved' | 'rejected' | 'pending' | 'contracted';

export interface ApplicationData {
  key: string;
  id: string;
  date: string;
  customer: string; // имя заказчика
  customerId: string | number; // id заказчика для перехода
  address: string;
  objectName: string;
  waterAmount: string;
  wastewaterAmount: string;
  status: StatusCode;
  rejectReason?: string;
  comment?: string;
  hasTu?: boolean;
  ty_id?: string;
}

export interface RejectFormData {
  reason: string;
  comment: string;
  attachments?: File[];
}

type IGetColumnsFn = (options: {
  onClick: (record: ApplicationData, action: actionType) => void;
  hasPermission: (value: string) => boolean;
}) => ColumnsType<ApplicationData>;

export const getColumns: IGetColumnsFn = ({ onClick, hasPermission }) => {
  const renderStatus = (status: StatusCode) => {
    switch (status) {
      case 'approved':
        return <Tag color='success'>{i18next.t('applications.statusTag.approved')}</Tag>;
      case 'rejected':
        return <Tag color='error'>{i18next.t('applications.statusTag.rejected')}</Tag>;
      case 'pending':
        return <Tag color='processing'>{i18next.t('applications.statusTag.pending')}</Tag>;
      case 'contracted':
        return <Tag>{i18next.t('applications.statusTag.contracted')}</Tag>;
    }
  };

  const renderAction = (record: ApplicationData) => {
    switch (record.status) {
      case 'pending':
        return (
          <Flex gap={12} justify='center'>
            <Button
              disabled={!hasPermission('delete_application')}
              size='large'
              type='default'
              onClick={() => {
                onClick(record, 'reject');
              }}
            >
              {i18next.t('applications.actions.reject')}
            </Button>
            <Button disabled={!hasPermission('change_application')} size='large' type='primary' onClick={() => onClick(record, 'approve')}>
              {i18next.t('applications.actions.approve')}
            </Button>
          </Flex>
        );
      case 'approved':
        return (
          <Button disabled={!hasPermission('add_technicalcondition')} size='large' type='primary' onClick={() => onClick(record, 'create')}>
            {i18next.t('applications.actions.create')}
          </Button>
        );
      case 'contracted':
        return (
          <Button size='large' type='primary' onClick={() => onClick(record, 'tuDetails')}>
            {i18next.t('applications.actions.goToTu')}
          </Button>
        );
      case 'rejected':
      default:
        return (
          <Button size='large' danger type='default'>
            {i18next.t('applications.actions.decline')}
          </Button>
        );
    }
  };

  return [
    {
      title: i18next.t('applications.columns.id'),
      dataIndex: 'id',
      key: 'id',
      align: 'center',
      render: (id: string) => {
        // Для перехода на детальную страницу заявки
        // navigate должен быть передан через options, иначе используем window.location
        return (
          <span
            style={{ color: '#1677ff', cursor: 'pointer', textDecoration: 'underline' }}
            onClick={() => {
              const w = window as Window & { navigate?: (path: string) => void };
              if (w.navigate) {
                w.navigate(`/dashboard/applications/${id}`);
              } else {
                window.location.href = `/dashboard/applications/${id}`;
              }
            }}
          >
            {id}
          </span>
        );
      },
      onCell: (record) => ({ style: { cursor: 'pointer' }, onClick: () => onClick(record, 'applicationView') })
    },
    { title: i18next.t('applications.columns.date'), dataIndex: 'date', key: 'date', align: 'center' },
    {
      title: i18next.t('applications.columns.customer'),
      dataIndex: 'customer',
      key: 'customer',
      align: 'center',
      render: (text: string, record: ApplicationData) => (
        <span style={{ color: '#1677ff', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => onClick(record, 'customerView')}>
          {text}
        </span>
      ),
      onCell: (record) => ({ style: { cursor: 'pointer' }, onClick: () => onClick(record, 'customerView') })
    },
    { title: i18next.t('applications.columns.address'), dataIndex: 'address', key: 'address', align: 'center' },
    { title: i18next.t('applications.columns.objectName'), dataIndex: 'objectName', key: 'objectName', width: 260 },
    { title: i18next.t('applications.columns.waterAmount'), dataIndex: 'waterAmount', key: 'waterAmount', align: 'center' },
    {
      title: i18next.t('applications.columns.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: StatusCode) => renderStatus(status),
      align: 'center'
    },
    {
      title: i18next.t('applications.columns.action'),
      key: 'action',
      render: (_: unknown, record: ApplicationData) => renderAction(record),
      align: 'center'
    }
  ];
};
