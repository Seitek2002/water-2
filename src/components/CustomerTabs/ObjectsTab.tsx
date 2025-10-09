// src/components/CustomerTabs/ObjectsTab.tsx
import { FC } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Button, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { EyeOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface ICustomerObject {
  id: number;
  full_address: string;
  title: string;
  contract_date: string | null;
  type: string | null;
  status: string;
  address_street: string;
  address_number: string;
  kadastr_number: string;
  usage_type: string | null;
  tu_status: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  updated_at: string;
  customer: number;
  creater: number;
}

interface IProps {
  objects: ICustomerObject[];
}

export const ObjectsTab: FC<IProps> = ({ objects }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const getStatusTag = (status: string) => {
    switch (status) {
      case 'active':
        return <Tag color='success'>{t('customers.status.active')}</Tag>;
      case 'inactive':
        return <Tag color='default'>{t('customers.status.inactive')}</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const columns: ColumnsType<ICustomerObject> = [
    {
      title: t('customers.details.columns.index'),
      key: 'index',
      width: 60,
      render: (_, __, index) => index + 1
    },
    {
      title: t('customers.details.columns.objectName'),
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record) => (
        <div>
          <Text strong>{text}</Text>
          <br />
          <Text type='secondary' style={{ fontSize: '12px' }}>
            {t('objectCard.cadastral')}: {record.kadastr_number}
          </Text>
        </div>
      )
    },
    {
      title: t('customers.details.columns.address'),
      dataIndex: 'full_address',
      key: 'full_address',
      render: (text: string, record) => (
        <div>
          <Text>{text}</Text>
          <br />
          <Text type='secondary' style={{ fontSize: '12px' }}>
            {record.address_street}, {record.address_number}
          </Text>
        </div>
      )
    },
    {
      title: t('customers.details.columns.tuStatus'),
      dataIndex: 'tu_status',
      key: 'tu_status',
      render: (status: string | null) =>
        status ? <Tag color='processing'>{status}</Tag> : <Text type='secondary'>{t('tuDetails.notSpecified')}</Text>
    },
    {
      title: t('customers.details.columns.objectStatus'),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status)
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
      width: 100,
      render: (_, record) => (
        <Button size='small' icon={<EyeOutlined />} onClick={() => navigate(`/dashboard/objects/${record.id}`)}>
          {t('customers.details.details')}
        </Button>
      )
    }
  ];

  return (
    <Table
      columns={columns}
      dataSource={objects}
      rowKey='id'
      pagination={false}
      locale={{ emptyText: t('customers.details.empty.objects') }}
      scroll={{ x: 'max-content' }}
    />
  );
};
