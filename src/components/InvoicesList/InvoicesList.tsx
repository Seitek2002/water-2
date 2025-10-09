import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Card, Flex, message, Space, Tag, Typography } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, DownloadOutlined } from '@ant-design/icons';
import type { IAccountingInvoice } from 'types/entities/accounting';

import { useLazyDownloadInvoiceQuery } from 'api/Accounting.api';

const { Title, Text } = Typography;

interface IProps {
  invoices: IAccountingInvoice[];
}

export const InvoicesList: FC<IProps> = ({ invoices }) => {
  const { t } = useTranslation();
  const [downloadInvoice, { isLoading: isDownloading }] = useLazyDownloadInvoiceQuery();

  const getInvoiceTypeLabel = useMemo(
    () => (invoiceType: string) => {
      switch (invoiceType) {
        case 'main':
          return { label: t('accounting.invoiceTypeLabels.main') || 'Основной', color: 'blue' };
        case 'paper_tu':
          return { label: t('accounting.invoiceTypeLabels.paper_tu') || 'Бумажные работы', color: 'orange' };
        default:
          return { label: invoiceType, color: 'default' };
      }
    },
    [t]
  );
  const getFileExtension = (contentType: string | null, defaultExt: string = 'xlsx'): string => {
    if (!contentType) return defaultExt;

    const typeMap: Record<string, string> = {
      'application/pdf': 'pdf',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
      'application/vnd.ms-excel': 'xls',
      'text/csv': 'csv'
    };

    return typeMap[contentType] || defaultExt;
  };

  const handleDownloadInvoice = async (invoice: IAccountingInvoice) => {
    try {
      const result = await downloadInvoice({ invoiceId: invoice.id.toString() });

      if ('error' in result) {
        throw new Error('Ошибка загрузки файла');
      }

      const blob = result.data;

      if (!blob || !(blob instanceof Blob)) {
        throw new Error('Получен неверный формат данных');
      }
      const fileExtension = getFileExtension(blob.type, 'xlsx');

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${invoice.invoice_number}.${fileExtension}`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);

      message.success(t('accounting.messages.downloadSuccess') || 'Счет успешно скачан');
    } catch (error: unknown) {
      console.error('Download invoice error:', error);

      let errorMessage = t('accounting.errors.downloadFailed') || 'Ошибка при скачивании счета';
      if (error && typeof error === 'object' && 'status' in error) {
        const httpError = error as { status: number; data?: { message?: string } };

        if (httpError.status === 404) {
          errorMessage = t('accounting.errors.fileNotFound') || 'Файл не найден';
        } else if (httpError.status === 401 || httpError.status === 403) {
          errorMessage = t('accounting.errors.accessDenied') || 'Нет доступа к файлу';
        } else if (httpError.data?.message) {
          errorMessage = httpError.data.message;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      message.error(errorMessage);
    }
  };

  const formatCurrency = (amount: string) => {
    const currency = t('tuDetails.currency') || 'сом';
    return `${parseFloat(amount).toLocaleString('ru-RU')} ${currency}`;
  };

  if (invoices.length === 0) {
    return (
      <div>
        <Title level={4} style={{ marginBottom: 16 }}>
          {t('protocolDetail.invoice.title') || 'Счета на оплату'} (0)
        </Title>
        <Card>
          <Text type='secondary'>{t('accounting.messages.noInvoices') || 'Счета не найдены'}</Text>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>
        {t('protocolDetail.invoice.title') || 'Счета на оплату'} ({invoices.length})
      </Title>

      {invoices.map((invoice) => {
        const typeInfo = getInvoiceTypeLabel(invoice.invoice_type);

        return (
          <Card key={invoice.id} size='small' style={{ marginBottom: 12 }}>
            <Flex justify='space-between' align='center'>
              <div style={{ flex: 1 }}>
                <Flex align='center' gap={8} style={{ marginBottom: 8 }}>
                  {invoice.is_paid ? (
                    <CheckCircleOutlined style={{ color: '#52c41a' }} aria-label={t('accounting.labels.paid') || 'Оплачен'} />
                  ) : (
                    <ClockCircleOutlined style={{ color: '#1890ff' }} aria-label={t('accounting.labels.pending') || 'Ожидает оплаты'} />
                  )}
                  <Text strong>#{invoice.invoice_number}</Text>
                  <Tag color={typeInfo.color}>{typeInfo.label}</Tag>
                  {invoice.is_paid && <Tag color='success'>{t('accounting.messages.paidTag') || 'Оплачен'}</Tag>}
                </Flex>

                <div style={{ fontSize: '12px', color: '#666', marginBottom: 4 }}>
                  {t('common.dateLabel') || 'Дата:'} {new Date(invoice.invoice_date).toLocaleDateString('ru-RU')}
                </div>

                <Flex gap={16} style={{ fontSize: '12px' }}>
                  {parseFloat(invoice.total_water_sum) > 0 && (
                    <Text>
                      {t('accounting.labels.waterSupply') || 'Водоснабжение'}: {formatCurrency(invoice.total_water_sum)}
                    </Text>
                  )}
                  {parseFloat(invoice.total_kanal_sum) > 0 && (
                    <Text>
                      {t('accounting.labels.sewer') || 'Канализация'}: {formatCurrency(invoice.total_kanal_sum)}
                    </Text>
                  )}
                  <Text strong>
                    {t('common.totalLabel') || 'Итого:'} {formatCurrency(invoice.total_sum)}
                  </Text>
                </Flex>
              </div>

              <Space>
                <Button
                  size='small'
                  icon={<DownloadOutlined />}
                  onClick={() => handleDownloadInvoice(invoice)}
                  loading={isDownloading}
                  disabled={!invoice.pdf_file}
                  aria-label={t('protocolDetail.buttons.downloadInvoice') || 'Скачать счет'}
                >
                  {t('protocolDetail.buttons.downloadInvoice') || 'Скачать'}
                </Button>
              </Space>
            </Flex>
          </Card>
        );
      })}
    </div>
  );
};
