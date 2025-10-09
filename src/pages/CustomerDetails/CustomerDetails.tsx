import { FC, useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { Alert, Button, Card, Spin, Tabs, Tag, Typography } from 'antd';
import { DownloadOutlined, EditOutlined } from '@ant-design/icons';
import { ApplicationsTab } from 'components/CustomerTabs/ApplicationsTab';
import { ObjectsTab } from 'components/CustomerTabs/ObjectsTab';
import { CustomerPaymentsTab } from 'components/CustomerTabs/PaymentsTab';
import { DashboardLayout } from 'components/DashboardLayout';

import { useGetCustomerByIdQuery } from 'api/Customer.api';
import { t } from 'i18next';

interface ICustomerFullResponse {
  id: number;
  full_name: string;
  category: string;
  created_at: string;
  updated_at: string;
  pasport: string | null;
  address: string;
  contact: string;
  status: string;
  customer_objects: Array<{
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
  }>;
  customer_applications: Array<{
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
  }>;
  customer_payments: Array<{
    id: number;
    payment_number: string;
    payment_date: string;
    amount: string;
    source: string;
    status: string;
    receipt_file: string | null;
    created_at: string;
    invoice: number;
  }>;
}

const tabItems = [
  { key: 'data', label: t('customers.details.tabs.data') },
  { key: 'objects', label: t('customers.details.tabs.objects') },
  { key: 'applications', label: t('customers.details.tabs.applications') },
  { key: 'payments', label: t('customers.details.tabs.payments') }
];

export const CustomerDetails: FC<{ title?: string }> = ({ title }) => {
  const navigate = useNavigate();
  const { customerId } = useParams<{ customerId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'data');

  // Используем существующий хук, но типизируем как расширенный ответ
  const { data, isLoading, isError } = useGetCustomerByIdQuery(customerId || '', { refetchOnMountOrArgChange: true }) as {
    data: ICustomerFullResponse | undefined;
    isLoading: boolean;
    isError: boolean;
  };

  const handleTabChange = (key: string): void => {
    setActiveTab(key);
    const next = new URLSearchParams(searchParams);
    next.set('tab', key);
    setSearchParams(next);
  };

  const handleEditClick = () => {
    navigate(`/dashboard/customers/${customerId}/edit`);
  };

  const handleExportClick = () => {
    navigate(`/dashboard/export-data`);
  };

  const renderTabContent = () => {
    if (!data) return null;

    switch (activeTab) {
      case 'data':
        return (
          <Card>
            <Typography.Title level={5} style={{ marginBottom: 8 }}>
              {data.full_name}
            </Typography.Title>
            <Typography.Text type='secondary' style={{ display: 'block', marginBottom: 16 }}>
              {data.category === '1' ? t('customers.category.physicalFull') : t('customers.category.legalFull')}
            </Typography.Text>
            <div style={{ marginBottom: 8 }}>
              <b>{t('customers.columns.registrationDate')}</b>
              <div>{data.created_at ? new Date(data.created_at).toLocaleDateString() : ''}</div>
            </div>
            <div style={{ marginBottom: 8 }}>
              <b>{t('customers.columns.passportData')}</b>
              <div>{data.pasport || '-'}</div>
            </div>
            <div style={{ marginBottom: 8 }}>
              <b>{t('customers.columns.address')}</b>
              <div>{data.address}</div>
            </div>
            <div style={{ marginBottom: 8 }}>
              <b>{t('customers.columns.contacts')}</b>
              <div>{data.contact}</div>
            </div>
            <div style={{ marginBottom: 8 }}>
              <b>{t('customers.columns.status')}</b>
              <div>
                <Tag color={data.status === 'active' ? 'success' : undefined}>
                  {data.status === 'active' ? t('customers.status.active') : t('customers.status.inactive')}
                </Tag>
              </div>
            </div>
          </Card>
        );

      case 'objects':
        return (
          <Card title={`${t('customers.details.tabs.objects')} (${data.customer_objects?.length || 0})`}>
            <ObjectsTab objects={data.customer_objects || []} />
          </Card>
        );

      case 'applications':
        return (
          <Card title={`${t('customers.details.tabs.applications')} (${data.customer_applications?.length || 0})`}>
            <ApplicationsTab applications={data.customer_applications || []} />
          </Card>
        );

      case 'payments':
        return (
          <Card title={`${t('customers.details.tabs.payments')} (${data.customer_payments?.length || 0})`}>
            <CustomerPaymentsTab payments={data.customer_payments || []} />
          </Card>
        );

      case 'documents':
        return (
          <Card>
            <Typography.Text type='secondary'>{t('common.inDevelopment')}</Typography.Text>
          </Card>
        );

      default:
        return null;
    }
  };

  useEffect(() => {
    const validKeys = (tabItems || []).map((i) => i?.key as string);
    const urlTab = searchParams.get('tab') || 'data';
    const next = validKeys.includes(urlTab) ? urlTab : 'data';
    if (next !== activeTab) {
      setActiveTab(next);
    }
  }, [searchParams, activeTab]);

  return (
    <DashboardLayout title={data?.full_name || title || 'dashboard.pages.customers'}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginBottom: 16 }}>
        <Button onClick={handleExportClick} icon={<DownloadOutlined />}>
          Export
        </Button>
        <Button onClick={handleEditClick} icon={<EditOutlined />} />
      </div>

      <Tabs items={tabItems} activeKey={activeTab} onChange={handleTabChange} style={{ marginBottom: 24 }} />

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <Spin size='large' />
        </div>
      ) : isError ? (
        <Alert type='error' message={t('customers.details.loadError')} />
      ) : data ? (
        renderTabContent()
      ) : null}
    </DashboardLayout>
  );
};
