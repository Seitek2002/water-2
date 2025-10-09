import { FC, useEffect, useState } from 'react';
import { Alert, Button, Card, Flex, Space, Spin, Table, TableColumnsType, Tag, Typography } from 'antd';
import { FileTextOutlined, PlusOutlined } from '@ant-design/icons';
import type { IPayment } from 'types/entities/accounting';
import { AddPaymentModal } from './AddPaymentModal';

import { useGetPaymentsByInvoiceQuery } from 'api/Accounting.api';
import { t } from 'i18next';

const { Title, Text } = Typography;

interface IProps {
  invoiceId: string;
  totalAmount: string;
  autoOpenModal?: boolean;
  onModalOpen?: () => void;
}

export const PaymentsTab: FC<IProps> = ({ invoiceId, totalAmount, autoOpenModal, onModalOpen }) => {
  const [isAddModalVisible, setIsAddModalVisible] = useState<boolean>(false);

  const {
    data: paymentsData,
    isLoading,
    isError
  } = useGetPaymentsByInvoiceQuery({
    invoiceId
  });
  useEffect(() => {
    if (autoOpenModal) {
      setIsAddModalVisible(true);
      onModalOpen?.();
    }
  }, [autoOpenModal, onModalOpen]);

  const handleAddPayment = () => {
    setIsAddModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsAddModalVisible(false);
  };

  const getStatusTag = (status: string) => {
    switch (status) {
      case 'completed':
        return <Tag color='success'>{t('protocolDetail.payment.status.received')}</Tag>;
      case 'pending':
        return <Tag color='warning'>{t('protocolDetail.payment.status.pending')}</Tag>;
      case 'failed':
        return <Tag color='error'>{t('protocolDetail.payment.status.failed')}</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const columns: TableColumnsType<IPayment> = [
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
        <Text strong>
          {amount} {t('tuDetails.currency')}
        </Text>
      )
    },
    {
      title: t('protocolDetail.payment.columns.source'),
      dataIndex: 'source',
      key: 'source'
    },
    {
      title: t('protocolDetail.payment.columns.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status)
    },
    {
      title: t('paymentsTab.table.actions'),
      key: 'actions',
      render: (_, record) => (
        <Space>
          {record.receipt_file && (
            <Button size='small' icon={<FileTextOutlined />} onClick={() => window.open(record.receipt_file || '', '_blank')}>
              {t('paymentsTab.buttons.receipt')}
            </Button>
          )}
        </Space>
      )
    }
  ];

  if (isLoading) {
    return (
      <Flex justify='center' align='center' style={{ minHeight: 200 }}>
        <Spin size='large' />
      </Flex>
    );
  }

  if (isError) {
    return (
      <Alert
        message={t('paymentsTab.messages.loadErrorTitle')}
        description={t('paymentsTab.messages.loadErrorDesc')}
        type='error'
        showIcon
      />
    );
  }

  const totalPaid = paymentsData?.reduce((sum, payment) => sum + parseFloat(payment.amount), 0) || 0;

  const remainingAmount = parseFloat(totalAmount) - totalPaid;

  return (
    <div>
      <Flex justify='space-between' align='center' style={{ marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>
          {t('routers.tuNumberPrefix')}04-472
        </Title>
        <Space>
          <Button type='primary' icon={<PlusOutlined />} onClick={handleAddPayment}>
            {t('paymentsTab.buttons.add')}
          </Button>
          <Button icon={<FileTextOutlined />}>{t('paymentsTab.buttons.pdf')}</Button>
        </Space>
      </Flex>

      <Table
        dataSource={paymentsData || []}
        columns={columns}
        rowKey='id'
        pagination={false}
        locale={{ emptyText: t('paymentsTab.table.empty') }}
        style={{ marginBottom: 24 }}
      />

      <Card>
        <Flex justify='space-between' align='center'>
          <Text strong>
            {t('protocolDetail.paid')} {totalPaid.toFixed(2)} {t('tuDetails.currency')} / {totalAmount} {t('tuDetails.currency')}
          </Text>
          {remainingAmount > 0 ? (
            <Button type='primary' danger>
              {t('paymentsTab.buttons.closeInvoice')}
            </Button>
          ) : (
            <Text type='success' strong>
              {t('paymentsTab.messages.invoiceFullyPaid')}
            </Text>
          )}
        </Flex>
      </Card>

      <AddPaymentModal visible={isAddModalVisible} onClose={handleCloseModal} invoiceId={invoiceId} />
    </div>
  );
};
