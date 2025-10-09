// src/components/CustomerTabs/ApplicationsTab.tsx
import { FC } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Button, Space, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { EnvironmentOutlined, EyeOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface ICustomerApplication {
  id: number;
  entity: number;
  customer: number;
  author: number;
  status: string;
  object: string;
  address: string;
  contact: string;
  quantity: string;
  pressure: string;
  waterRequired: string;
  firefightingExpenses: string;
  x: number;
  y: number;
  created_at: string;
  updated_at: string;
  application_files: unknown[];
  ty_id: number | null;
}

interface IProps {
  applications: ICustomerApplication[];
}

export const ApplicationsTab: FC<IProps> = ({ applications }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const getStatusTag = (status: string) => {
    switch (status) {
      case 'pending':
        return <Tag color='warning'>{t('applications.statusTag.pending')}</Tag>;
      case 'contracted':
        return <Tag color='success'>{t('applications.statusTag.contracted')}</Tag>;
      case 'approved':
        return <Tag color='processing'>{t('applications.statusTag.approved')}</Tag>;
      case 'rejected':
        return <Tag color='error'>{t('applications.statusTag.rejected')}</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const columns: ColumnsType<ICustomerApplication> = [
    {
      title: t('customers.details.columns.index'),
      key: 'index',
      width: 60,
      render: (_, __, index) => index + 1
    },
    {
      title: t('customers.details.columns.address'),
      dataIndex: 'address',
      key: 'address',
      width: 200
    },
    {
      title: t('customers.details.columns.contact'),
      dataIndex: 'contact',
      key: 'contact',
      width: 150
    },
    {
      title: t('customers.details.columns.parameters'),
      key: 'parameters',
      render: (_, record) => (
        <div>
          <Text style={{ fontSize: '12px' }}>
            {t('applicationsCreate.form.labels.waterAmountRequired')}: {record.quantity} |{' '}
            {t('applicationsCreate.form.labels.pressureRequired')}: {record.pressure}
          </Text>
          <br />
          <Text style={{ fontSize: '12px' }}>
            {t('applicationDetails.labels.waterRequired')}: {record.waterRequired} |{' '}
            {t('applicationsCreate.form.labels.firefightingExpenses')}: {record.firefightingExpenses}
          </Text>
        </div>
      )
    },
    {
      title: t('customers.details.columns.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status)
    },
    {
      title: t('customers.details.columns.tu'),
      dataIndex: 'ty_id',
      key: 'ty_id',
      render: (tyId: number | null) =>
        tyId ? (
          <Button size='small' type='link' onClick={() => navigate(`/dashboard/technical-conditions/tu-details/${tyId}`)}>
            {t('routers.tuNumberPrefix')} {tyId}
          </Button>
        ) : (
          <Text type='secondary'>{t('customers.details.notCreated')}</Text>
        )
    },
    {
      title: t('customers.details.columns.createdAt'),
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleDateString('ru-RU')
    },
    {
      title: t('customers.details.columns.actions'),
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button size='small' icon={<EyeOutlined />} onClick={() => navigate(`/dashboard/applications/${record.id}`)}>
            {t('customers.details.details')}
          </Button>
          {record.x && record.y && (
            <Button
              size='small'
              icon={<EnvironmentOutlined />}
              onClick={() => {
                // Открываем карту с координатами
                window.open(`https://maps.google.com/?q=${record.x},${record.y}`, '_blank');
              }}
              title={t('customers.details.showOnMap')}
            />
          )}
        </Space>
      )
    }
  ];

  return (
    <Table
      columns={columns}
      dataSource={applications}
      rowKey='id'
      pagination={false}
      locale={{ emptyText: t('customers.details.empty.applications') }}
      scroll={{ x: 'max-content' }}
    />
  );
};
