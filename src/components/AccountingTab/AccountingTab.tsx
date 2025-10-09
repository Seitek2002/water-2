import { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Button, Card, Col, Flex, message, Row, Space, Spin, Table, TableColumnsType, Tabs, TabsProps, Typography } from 'antd';
import { ClockCircleOutlined, DownloadOutlined, EditOutlined, UploadOutlined } from '@ant-design/icons';
import { EditProtocolModal } from 'components/EditProtocolModal/EditProtocolModal';
import { InvoicesList } from 'components/InvoicesList/InvoicesList';
import { EnhancedPaymentsTab } from 'components/PaymentsTab/EnhancedPaymentsTab';
import { IGetTyById } from 'types/entities';

import {
  useGenerateInvoiceMutation,
  useGetAccountingProtocolQuery,
  useGetInvoicesByProtocolQuery,
  useLazyDownloadProtocolQuery
} from 'api/Accounting.api';
import { useLazyGetInvoicesByProtocolTyQuery } from 'api/Buhgalteria.api';

const { Title, Text } = Typography;

interface IProps {
  technicalConditionId: string;
  onOpenPaymentModal?: () => void;
  data?: IGetTyById;
}

interface IProtocolTableData {
  key: string;
  item: string;
  price: string;
  badge?: string;
}

export const AccountingTab: FC<IProps> = ({ technicalConditionId, data, onOpenPaymentModal }) => {
  const [activeAccountingTab, setActiveAccountingTab] = useState<string>('1');
  const [isEditModalVisible, setIsEditModalVisible] = useState<boolean>(false);
  const [shouldOpenPaymentModal, setShouldOpenPaymentModal] = useState<boolean>(false);
  const { t } = useTranslation();

  const {
    data: protocolData,
    isLoading: protocolLoading,
    isError: protocolError,
    refetch: refetchProtocol
  } = useGetAccountingProtocolQuery({
    technicalConditionId
  });

  const {
    data: invoicesData,
    isLoading: invoiceLoading,
    isError: invoiceError,
    refetch: refetchInvoice
  } = useGetInvoicesByProtocolQuery({ protocolId: protocolData?.id.toString() || '' }, { skip: !protocolData?.id });

  const [generateInvoice, { isLoading: isGenerating }] = useGenerateInvoiceMutation();
  const [downloadProtocol, { isLoading: isDownloading }] = useLazyDownloadProtocolQuery();
  const [getInvoicesByProtocolTy] = useLazyGetInvoicesByProtocolTyQuery();

  const currency = t('tuDetails.currency');
  const hasInvoices = invoicesData && invoicesData.length > 0 && !invoiceError;

  // Убираем блокировку редактирования - теперь можно редактировать всегда
  // const isEditDisabled = hasInvoices; // Старая логика
  const isEditDisabled = false; // Разрешаем редактирование всегда

  useEffect(() => {
    if (onOpenPaymentModal) {
      setActiveAccountingTab('2');
      onOpenPaymentModal();
    }
  }, [onOpenPaymentModal]);

  const handleUpload = () => {
    setActiveAccountingTab('2');
    setShouldOpenPaymentModal(true);
  };

  const handleEditClick = () => {
    // Убираем предупреждение о невозможности редактирования
    setIsEditModalVisible(true);
  };

  const handleEditModalClose = () => {
    setIsEditModalVisible(false);
    refetchProtocol();
  };

  // Обновленная функция для обработки успешного редактирования
  const handleEditSuccess = async () => {
    try {
      // Обновляем данные протокола
      await refetchProtocol();

      // Если есть счета, регенерируем их с новыми данными
      if (hasInvoices && protocolData?.id) {
        message.info(t('accounting.messages.updatingInvoices'));

        try {
          await generateInvoice({ protocolId: protocolData.id.toString() }).unwrap();
          await refetchInvoice();
          await getInvoicesByProtocolTy({ protocol_id: protocolData.id.toString() });

          message.success(t('accounting.messages.protocolRegeneratedInvoices'));
        } catch (invoiceError) {
          console.error('Error regenerating invoices:', invoiceError);
          message.warning(t('accounting.messages.invoicesUpdateWarning'));
        }
      } else {
        message.success(t('accounting.messages.protocolUpdated'));
      }
    } catch (error) {
      console.error('Error in handleEditSuccess:', error);
      message.error(t('accounting.errors.protocolUpdateError'));
    }
  };

  const handleGenerateInvoice = async () => {
    if (!protocolData?.id) {
      message.error(t('accounting.errors.protocolIdNotFound'));
      return;
    }

    try {
      const response = await generateInvoice({ protocolId: protocolData.id.toString() }).unwrap();
      if (Array.isArray(response) && response.length > 0) {
        message.success(t('accounting.messages.generateInvoiceSuccess'));
        refetchInvoice();
      } else if (!Array.isArray(response)) {
        message.success(t('accounting.messages.generateInvoiceSuccess'));
        refetchInvoice();
      } else {
        throw new Error('Empty response array');
      }
      getInvoicesByProtocolTy({ protocol_id: protocolData.id.toString() || '' });
    } catch (error: unknown) {
      console.error('Generate invoice error:', error);

      if (error && typeof error === 'object' && 'status' in error) {
        const httpError = error as { status: number };

        if (httpError.status === 404) {
          message.error(t('accounting.errors.endpointNotFound'));
        } else if (httpError.status === 400) {
          message.error(t('accounting.errors.badRequest'));
        } else if (httpError.status === 500) {
          message.error(t('accounting.errors.serverError'));
        } else {
          message.error(t('accounting.messages.generateInvoiceError'));
        }
      } else {
        message.error(t('accounting.messages.generateInvoiceError'));
      }
    }
  };

  const handleDownloadProtocol = async () => {
    try {
      const result = await downloadProtocol({ technicalConditionId }).unwrap();
      const url = window.URL.createObjectURL(result);
      const link = document.createElement('a');
      link.href = url;
      link.download = `protocol-${technicalConditionId}.xlsx`;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);

      message.success(t('accounting.messages.protocolDownloaded'));
    } catch (error) {
      console.error('Download protocol error:', error);
      message.error(t('accounting.errors.downloadProtocolError'));
    }
  };

  const formatCurrency = (amount: string | number) => {
    return `${parseFloat(amount.toString()).toLocaleString('ru-RU')} ${currency}`;
  };

  if (protocolLoading) {
    return (
      <Flex justify='center' align='center' style={{ minHeight: 200 }}>
        <Spin size='large' />
      </Flex>
    );
  }

  if (protocolError || !protocolData) {
    return <Alert message={t('accounting.errors.loadTitle')} description={t('accounting.errors.loadDesc')} type='error' showIcon />;
  }

  const protocolTableData: IProtocolTableData[] = [
    {
      key: '0',
      item: t('protocolDoc.companyName'),
      price: ''
    },
    {
      key: '1',
      item: t('protocolEdit.fields.load'),
      price: `${protocolData.load}`
    },
    {
      key: '4',
      item: t('accounting.labels.sewer'),
      price: `${protocolData.kanal_price} ${currency}`
    },
    {
      key: '3',
      item: t('accounting.labels.waterSupply'),
      price: `${protocolData.water_price} ${currency}`
    },
    {
      key: '10',
      item: t('protocolEdit.fields.coefficient'),
      price: `${protocolData.coefficient}`
    },
    {
      key: '6',
      item: t('accounting.protocol.nds'),
      price: protocolData.nds ? `${protocolData.nds} ${currency}` : t('tuDetails.notSpecified')
    },
    {
      key: '5',
      item: t('accounting.protocol.nsp'),
      price: `${protocolData.nsp || '0'} ${currency}`
    },
    {
      key: '2',
      item: t('accounting.protocol.waterConnectNoTaxes'),
      price: `${protocolData.water_sum} ${currency}`
    },
    {
      key: '2',
      item: t('accounting.protocol.sewerConnectNoTaxes'),
      price: `${protocolData.kanal_sum} ${currency}`
    },
    {
      key: '9',
      item: t('accounting.labels.total') + ':',
      price: `${protocolData.total_sum_main} ${currency}`,
      badge: t('protocolDoc.takeaway')
    }
  ];

  const paperWorkData: IProtocolTableData[] = [
    {
      key: 'paper-1',
      item: t('accounting.protocol.paperWorkWater'),
      price: `${protocolData.paper_water_sum || '0'} ${currency}`
    },
    {
      key: 'paper-2',
      item: t('accounting.protocol.paperWorkSewer'),
      price: `${protocolData.paper_kanal_sum || '0'} ${currency}`
    },
    {
      key: 'paper-3',
      item: t('accounting.protocol.nspWaterPaper'),
      price: formatCurrency(protocolData.nsp_water_paper)
    },
    {
      key: 'paper-4',
      item: t('accounting.protocol.nspSewerPaper'),
      price: formatCurrency(protocolData.nsp_kanal_paper)
    },
    {
      key: 'paper-5',
      item: t('accounting.protocol.nspTotalPaper'),
      price: formatCurrency(protocolData.nsp_paper)
    },
    {
      key: 'paper-6',
      item: t('accounting.protocol.ndsWaterPaper'),
      price: formatCurrency(protocolData.nds_water_paper)
    },
    {
      key: 'paper-7',
      item: t('accounting.protocol.ndsSewerPaper'),
      price: formatCurrency(protocolData.nds_kanal_paper)
    },
    {
      key: 'paper-8',
      item: t('accounting.protocol.ndsTotalPaper'),
      price: formatCurrency(protocolData.nds_paper)
    },
    {
      key: 'paper-9',
      item: t('accounting.labels.total') + ':',
      price: formatCurrency(protocolData.total_sum_paper),
      badge: t('protocolDoc.takeaway')
    }
  ];

  const columns: TableColumnsType<IProtocolTableData> = [
    {
      title: '',
      dataIndex: 'item',
      key: 'item',
      render: (text: string, record) => (
        <Flex justify='space-between' align='center' wrap='wrap' gap={8}>
          <Text strong={record.badge !== undefined}>{text}</Text>
        </Flex>
      )
    },
    {
      title: '',
      dataIndex: 'price',
      key: 'price',
      align: 'right' as const,
      render: (text: string, record) => <Text strong={record.badge !== undefined}>{text}</Text>
    }
  ];

  const accountingTabItems: TabsProps['items'] = [
    {
      key: '1',
      label: t('protocolDetail.tabs.protocol'),
      children: (
        <Card>
          <Flex justify='space-between' align='flex-start' style={{ marginBottom: 24 }} wrap='wrap' gap={16}>
            <Title level={4} style={{ margin: 0, flex: '1 1 auto', minWidth: 200 }}>
              {t('routers.tuNumberPrefix')}
              {technicalConditionId}-472
            </Title>
            <Space wrap size={[12, 8]} style={{ flex: '0 0 auto' }}>
              <Button icon={<EditOutlined />} type='primary' onClick={handleEditClick} size='middle' disabled={isEditDisabled}>
                {t('common.edit')}
              </Button>
              <Button icon={<DownloadOutlined />} type='default' onClick={handleDownloadProtocol} loading={isDownloading} size='middle'>
                {t('protocolDetail.buttons.downloadProtocol')}
              </Button>
            </Space>
          </Flex>

          <div style={{ marginBottom: 24 }}>
            <Title level={5} style={{ marginBottom: 16 }}>
              {t('accounting.sections.mainCalculations')}
            </Title>
            <div style={{ overflowX: 'auto' }}>
              <Table
                dataSource={protocolTableData}
                columns={columns}
                pagination={false}
                showHeader={false}
                size='middle'
                bordered
                style={{ marginBottom: 16, minWidth: 500 }}
              />
            </div>
          </div>

          <div>
            <Title level={5} style={{ marginBottom: 16 }}>
              {t('accounting.sections.issueTu')}
            </Title>
            <div style={{ overflowX: 'auto' }}>
              <Table
                dataSource={paperWorkData}
                columns={columns}
                pagination={false}
                showHeader={false}
                size='middle'
                bordered
                style={{ marginBottom: 0, minWidth: 500 }}
              />
            </div>
          </div>
        </Card>
      )
    },
    {
      key: '2',
      label: t('protocolDetail.tabs.payments'),
      children:
        invoicesData && invoicesData.length > 0 && !invoiceError ? (
          <EnhancedPaymentsTab
            invoices={invoicesData}
            autoOpenModal={shouldOpenPaymentModal}
            onModalOpen={() => setShouldOpenPaymentModal(false)}
          />
        ) : (
          <div>
            {t('accounting.messages.needCreateInvoiceFirst')}
            {invoiceError && (
              <Alert
                message={t('accounting.errors.invoicesLoadTitle')}
                description={t('accounting.errors.invoicesLoadDesc')}
                type='warning'
                style={{ marginTop: 16 }}
              />
            )}
          </div>
        )
    }
  ];

  if (data?.status !== 'active') {
    return t('tuDetails.archivedMessage');
  }

  return (
    <Space direction='vertical' size={24} style={{ width: '100%' }}>
      <div style={{ width: '100%' }}>
        <Tabs activeKey={activeAccountingTab} items={accountingTabItems} onChange={setActiveAccountingTab} tabPosition='top' size='large' />
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} sm={24} md={12} lg={12} xl={12} xxl={12}>
          <Card style={{ height: '100%' }} bodyStyle={{ padding: '20px' }}>
            {invoiceLoading && (
              <Flex justify='center' style={{ margin: '20px 0' }}>
                <Spin size='large' />
              </Flex>
            )}

            {!invoiceLoading && hasInvoices ? (
              <>
                <InvoicesList invoices={invoicesData} />
              </>
            ) : !invoiceLoading && !hasInvoices ? (
              <>
                <Title level={4} style={{ fontSize: '18px', marginBottom: 20 }}>
                  {t('protocolDetail.invoice.title')}
                </Title>
                <div style={{ textAlign: 'center', padding: '30px 0' }}>
                  <ClockCircleOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
                  <div style={{ marginBottom: '20px' }}>
                    <Text type='secondary' style={{ fontSize: '16px' }}>
                      {t('accounting.labels.invoicesNotFound')}
                    </Text>
                  </div>
                  <Button
                    type='primary'
                    size='large'
                    onClick={handleGenerateInvoice}
                    loading={isGenerating}
                    disabled={data?.stage !== 'approved' || data?.status !== 'active'}
                    block
                    style={{ maxWidth: '280px', margin: '0 auto', height: '48px', fontSize: '16px' }}
                  >
                    {t('protocolDetail.buttons.generateInvoice')}
                  </Button>
                </div>
              </>
            ) : null}

            {invoiceError && (
              <Alert
                message={t('accounting.errors.invoicesWarnTitle')}
                description={t('accounting.errors.invoicesWarnDesc')}
                type='warning'
                style={{ marginTop: 16 }}
              />
            )}
          </Card>
        </Col>

        <Col xs={24} sm={24} md={12} lg={12} xl={12} xxl={12}>
          <Card style={{ height: '100%' }} bodyStyle={{ padding: '20px' }}>
            <Title level={4} style={{ fontSize: '18px', marginBottom: 20 }}>
              {t('protocolDetail.invoice.uploadReceipt')}
            </Title>

            <div
              style={{
                backgroundColor: '#327BE8',
                height: 8,
                borderRadius: 4,
                margin: '20px 0'
              }}
            />

            <Text
              type='secondary'
              style={{
                display: 'block',
                marginBottom: 24,
                fontSize: '14px',
                lineHeight: '1.6'
              }}
            >
              {t('tuDetails.hint.uploadToFinishTu')}
            </Text>

            <Button
              type='primary'
              block
              icon={<UploadOutlined />}
              onClick={handleUpload}
              size='large'
              style={{ height: '48px', fontSize: '16px' }}
            >
              {t('common.upload')}
            </Button>
          </Card>
        </Col>
      </Row>

      <EditProtocolModal
        visible={isEditModalVisible}
        onClose={handleEditModalClose}
        protocolData={protocolData || null}
        onSuccess={handleEditSuccess} // Передаем новый обработчик
      />
    </Space>
  );
};
