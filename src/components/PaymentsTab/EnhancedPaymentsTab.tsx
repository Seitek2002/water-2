import { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Button, Card, Collapse, Flex, Progress, Space, Spin, Table, TableColumnsType, Tag, Typography } from 'antd';
import { FileTextOutlined, PlusOutlined } from '@ant-design/icons';
import type { IAccountingInvoice, IPayment } from 'types/entities/accounting';
import { AddPaymentModal } from './AddPaymentModal';

import { useGetPaymentsByInvoiceQuery } from 'api/Accounting.api';

const { Title, Text } = Typography;

interface IProps {
  invoices: IAccountingInvoice[];
  autoOpenModal?: boolean;
  onModalOpen?: () => void;
}

interface IInvoicePaymentsProps {
  invoice: IAccountingInvoice;
  onAddPayment: (invoiceId: string) => void;
}

const InvoicePayments: FC<IInvoicePaymentsProps> = ({ invoice, onAddPayment }) => {
  const { t } = useTranslation();

  const {
    data: paymentsData,
    isLoading,
    isError
  } = useGetPaymentsByInvoiceQuery({
    invoiceId: invoice.id.toString()
  });

  const payments = paymentsData || [];

  const getStatusTag = (status: string) => {
    switch (status) {
      case 'received':
        return <Tag color='success'>{t('protocolDetail.payment.status.received')}</Tag>;
      case 'pending':
        return <Tag color='warning'>{t('protocolDetail.payment.status.pending')}</Tag>;
      case 'failed':
        return <Tag color='error'>{t('protocolDetail.payment.status.failed')}</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const formatCurrency = (amount: string | number) => {
    return `${parseFloat(amount.toString()).toLocaleString('ru-RU')} ${t('tuDetails.currency') || 'сом'}`;
  };

  const columns: TableColumnsType<IPayment> = [
    {
      title: t('protocolDetail.payment.columns.paymentNum'),
      dataIndex: 'payment_number',
      key: 'payment_number',
      width: 150,
      render: (text: string) => <Text strong>{text}</Text>
    },
    {
      title: t('protocolDetail.payment.columns.date'),
      dataIndex: 'payment_date',
      key: 'payment_date',
      width: 120,
      render: (date: string) => new Date(date).toLocaleDateString('ru-RU')
    },
    {
      title: t('protocolDetail.payment.columns.amount'),
      dataIndex: 'amount',
      key: 'amount',
      width: 150,
      render: (amount: string) => <Text strong>{formatCurrency(amount)}</Text>
    },
    {
      title: t('protocolDetail.payment.columns.source'),
      dataIndex: 'source',
      key: 'source',
      width: 120
    },
    {
      title: t('protocolDetail.payment.columns.status'),
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => getStatusTag(status)
    },
    {
      title: t('paymentsTab.table.actions'),
      key: 'actions',
      width: 100,
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

  const totalPaid = payments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
  const totalAmount = parseFloat(invoice.total_sum);
  const remainingAmount = totalAmount - totalPaid;
  const progressPercent = totalAmount > 0 ? (totalPaid / totalAmount) * 100 : 0;

  if (isLoading) {
    return (
      <Flex justify='center' align='center' style={{ minHeight: 100 }}>
        <Spin />
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

  return (
    <div style={{ padding: '0 16px 16px' }}>
      <Card size='small' style={{ marginBottom: 16, backgroundColor: '#fafafa' }}>
        <Flex justify='space-between' align='center' style={{ marginBottom: 12 }}>
          <div>
            <Text strong>
              {t('accounting.labels.paid')}: {formatCurrency(totalPaid)}
            </Text>
            <br />
            <Text type='secondary'>
              {t('paymentsTab.of')} {formatCurrency(totalAmount)}
            </Text>
          </div>
          <div style={{ textAlign: 'right' }}>
            {remainingAmount > 0 ? (
              <Text type='danger'>
                {t('common.remaining')}: {formatCurrency(remainingAmount)}
              </Text>
            ) : (
              <Text type='success' strong>
                {t('paymentsTab.messages.invoiceFullyPaid')}
              </Text>
            )}
          </div>
        </Flex>

        <Progress
          percent={Math.round(progressPercent)}
          status={progressPercent >= 100 ? 'success' : 'active'}
          strokeColor={progressPercent >= 100 ? '#52c41a' : '#1890ff'}
        />
      </Card>

      {/* Кнопка добавления платежа */}
      <Flex justify='space-between' align='center' style={{ marginBottom: 16 }}>
        <Text strong>
          {t('protocolDetail.tabs.payments')} ({payments.length})
        </Text>
        <Button type='primary' size='small' icon={<PlusOutlined />} onClick={() => onAddPayment(invoice.id.toString())}>
          {t('paymentsTab.buttons.add')}
        </Button>
      </Flex>

      <Table
        dataSource={payments}
        columns={columns}
        rowKey='id'
        pagination={false}
        size='small'
        locale={{ emptyText: t('paymentsTab.table.empty') }}
        scroll={{ x: 700 }}
      />
    </div>
  );
};

export const EnhancedPaymentsTab: FC<IProps> = ({ invoices, autoOpenModal, onModalOpen }) => {
  const [isAddModalVisible, setIsAddModalVisible] = useState<boolean>(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>('');
  const [activeKeys, setActiveKeys] = useState<string | string[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    if (autoOpenModal && invoices.length > 0) {
      const mainInvoice = invoices.find((inv) => inv.invoice_type === 'main') || invoices[0];
      setSelectedInvoiceId(mainInvoice.id.toString());
      setIsAddModalVisible(true);
      onModalOpen?.();
    }
  }, [autoOpenModal, onModalOpen, invoices]);

  useEffect(() => {
    if (invoices.length > 0) {
      setActiveKeys(invoices.map((inv) => inv.id.toString()));
    }
  }, [invoices]);

  const handleAddPayment = (invoiceId: string) => {
    setSelectedInvoiceId(invoiceId);
    setIsAddModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsAddModalVisible(false);
    setSelectedInvoiceId('');
  };

  const getInvoiceTypeLabel = (invoiceType: string) => {
    switch (invoiceType) {
      case 'main':
        return { label: t('accounting.invoiceTypeLabels.main'), color: 'blue' as const };
      case 'paper_tu':
        return { label: t('accounting.invoiceTypeLabels.paper_tu'), color: 'orange' as const };
      default:
        return { label: invoiceType, color: 'default' as const };
    }
  };

  const formatCurrency = (amount: string | number) => {
    return `${parseFloat(amount.toString()).toLocaleString('ru-RU')} ${t('tuDetails.currency') || 'сом'}`;
  };

  if (invoices.length === 0) {
    return (
      <Alert
        message={t('accounting.labels.invoicesNotFound') || t('accounting.errors.loadTitle')}
        description={t('accounting.messages.needCreateInvoiceFirst')}
        type='info'
        showIcon
      />
    );
  }

  const collapseItems = invoices.map((invoice) => {
    const typeInfo = getInvoiceTypeLabel(invoice.invoice_type);
    const totalAmount = parseFloat(invoice.total_sum);

    return {
      key: invoice.id.toString(),
      label: (
        <Flex justify='space-between' align='center' style={{ width: '100%', paddingRight: 16 }}>
          <Space>
            <Tag color={typeInfo.color}>{typeInfo.label}</Tag>
            <Text strong>#{invoice.invoice_number}</Text>
            {invoice.is_paid && <Tag color='success'>{t('accounting.labels.paid')}</Tag>}
          </Space>
          <Space>
            <Text>
              {t('common.amountLabel') || 'Сумма:'} {formatCurrency(totalAmount)}
            </Text>
          </Space>
        </Flex>
      ),
      children: <InvoicePayments invoice={invoice} onAddPayment={handleAddPayment} />,
      style: {
        marginBottom: 8,
        border: invoice.is_paid ? '1px solid #52c41a' : undefined
      }
    };
  });

  return (
    <div>
      <Flex justify='space-between' align='center' style={{ marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>
          {t('paymentsTab.headingByInvoices')}
        </Title>
      </Flex>

      <Collapse activeKey={activeKeys} onChange={setActiveKeys} size='large' items={collapseItems} />

      <AddPaymentModal visible={isAddModalVisible} onClose={handleCloseModal} invoiceId={selectedInvoiceId} />
    </div>
  );
};
