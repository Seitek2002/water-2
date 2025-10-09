// src/components/CustomerTabs/PaymentsTab.tsx
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { FileTextOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface ICustomerPayment {
  id: number;
  payment_number: string;
  payment_date: string;
  amount: string;
  source: string;
  status: string;
  receipt_file: string | null;
  created_at: string;
  invoice: number;
}

interface IProps {
  payments: ICustomerPayment[];
}

export const CustomerPaymentsTab: FC<IProps> = ({ payments }) => {
  const { t } = useTranslation();
  const getStatusTag = (status: string) => {
    switch (status) {
      case 'completed':
        return <Tag color='success'>{t('protocolDetail.payment.status.received')}</Tag>;
      case 'processing':
        return <Tag color='processing'>{t('protocolDetail.payment.status.pending')}</Tag>;
      case 'pending':
        return <Tag color='warning'>{t('protocolDetail.payment.status.pending')}</Tag>;
      case 'failed':
        return <Tag color='error'>{t('protocolDetail.payment.status.failed')}</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const columns: ColumnsType<ICustomerPayment> = [
    {
      title: t('customers.details.columns.index'),
      key: 'index',
      width: 60,
      render: (_, __, index) => index + 1
    },
    {
      title: t('protocolDetail.payment.columns.paymentNum'),
      dataIndex: 'payment_number',
      key: 'payment_number',
      render: (text: string) => <Text strong>{text}</Text>
    },
    {
      title: t('protocolDetail.payment.columns.date'),
      dataIndex: 'payment_date',
      key: 'payment_date',
      render: (date: string) => new Date(date).toLocaleDateString('ru-RU')
    },
    {
      title: t('protocolDetail.payment.columns.amount'),
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: string) => (
        <Text strong style={{ color: '#52c41a' }}>
          {parseFloat(amount).toLocaleString('ru-RU')} KGZ
        </Text>
      )
    },
    {
      title: t('protocolDetail.payment.columns.source'),
      dataIndex: 'source',
      key: 'source',
      render: (source: string) => {
        const sourceLabels: Record<string, string> = {
          'online transfer': 'Онлайн перевод',
          'bank transfer': 'Банковский перевод',
          cash: 'Наличные',
          card: 'Карта'
        };
        return sourceLabels[source] || source;
      }
    },
    {
      title: t('protocolDetail.payment.columns.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status)
    },
    {
      title: t('protocolDetail.invoice.title'),
      dataIndex: 'invoice',
      key: 'invoice',
      render: (invoiceId: number) => <Text type='secondary'>#{invoiceId}</Text>
    },
    {
      title: t('paymentsTab.buttons.receipt'),
      dataIndex: 'receipt_file',
      key: 'receipt_file',
      render: (file: string | null) =>
        file ? (
          <Button size='small' icon={<FileTextOutlined />} onClick={() => window.open(file, '_blank')}>
            {t('common.download')}
          </Button>
        ) : (
          <Text type='secondary'>{t('objectDetail.noData')}</Text>
        )
    },
    {
      title: t('customers.details.columns.createdAt'),
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleDateString('ru-RU')
    }
  ];

  // Подсчет общей суммы
  const totalAmount = payments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);

  return (
    <div>
      <div
        style={{
          marginBottom: 16,
          padding: 16,
          backgroundColor: '#f6ffed',
          border: '1px solid #b7eb8f',
          borderRadius: 8
        }}
      >
        <Text strong>
          {t('customers.details.paymentsSummary.totalAmount')}: {totalAmount.toLocaleString('ru-RU')} KGZ
        </Text>
        <br />
        <Text type='secondary'>
          {t('customers.details.paymentsSummary.totalCount')}: {payments.length}
        </Text>
      </div>

      <Table
        columns={columns}
        dataSource={payments}
        rowKey='id'
        pagination={false}
        locale={{ emptyText: t('paymentsTab.table.empty') }}
        scroll={{ x: 'max-content' }}
      />
    </div>
  );
};
