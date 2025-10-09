import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { UploadFile, UploadProps } from 'antd';
import { Alert, Button, Card, Col, Divider, List, message, Row, Space, Spin, Steps, Table, Tag, Typography, Upload } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  CheckCircleOutlined,
  DownloadOutlined,
  ExclamationCircleOutlined,
  FileExcelOutlined,
  InfoCircleOutlined,
  UploadOutlined
} from '@ant-design/icons';

import {
  downloadErrorReport,
  formatFileSize,
  type ImportTyResponse,
  useImportTyFromExcelMutation,
  validateExcelFile
} from 'api/TyImport.api';

const { Title, Text, Paragraph } = Typography;

interface ExcelColumn {
  key: string;
  title: string;
  description: string;
  required: boolean;
  example: string;
}

const EXCEL_KEYS: Array<{ key: string; required: boolean }> = [
  { key: 'tu_number', required: true },
  { key: 'registration_date', required: true },
  { key: 'customer', required: true },
  { key: 'address', required: true },
  { key: 'object_name', required: true },
  { key: 'water_quantity', required: true },
  { key: 'sewage_quantity', required: true },
  { key: 'contract_info', required: false },
  { key: 'invoice_number', required: false },
  { key: 'payment_amount', required: false },
  { key: 'payment_date', required: false }
];

export const TyImportPage: FC = () => {
  const { t } = useTranslation();

  const [currentStep, setCurrentStep] = useState<number>(0);
  const [uploadedFile, setUploadedFile] = useState<UploadFile | null>(null);
  const [importResult, setImportResult] = useState<ImportTyResponse | null>(null);

  const [importTyFromExcel, { isLoading: isImporting }] = useImportTyFromExcelMutation();

  const errorColumns: ColumnsType<string> = [
    {
      title: t('tyImport.errors.table.index'),
      key: 'index',
      width: 60,
      render: (_: string, __: string, index: number) => <Tag color='orange'>#{index + 1}</Tag>
    },
    {
      title: t('tyImport.errors.table.description'),
      key: 'error',
      render: (error: string) => <Text type='danger'>{error}</Text>
    }
  ];

  const excelColumnsData: ExcelColumn[] = EXCEL_KEYS.map((c) => ({
    key: c.key,
    title: t(`tyImport.excel.columns.${c.key}.title`),
    description: t(`tyImport.excel.columns.${c.key}.description`),
    example: t(`tyImport.excel.columns.${c.key}.example`),
    required: c.required
  }));

  const formatColumns: ColumnsType<ExcelColumn> = [
    {
      title: t('tyImport.excelFormat.columnsTable.title'),
      dataIndex: 'title',
      key: 'title',
      render: (title: string, record: ExcelColumn) => (
        <Space>
          <Text strong>{title}</Text>
          {record.required && <Tag color='red'>{t('tyImport.excelFormat.columnsTable.requiredTag')}</Tag>}
        </Space>
      )
    },
    {
      title: t('tyImport.excelFormat.columnsTable.description'),
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: t('tyImport.excelFormat.columnsTable.example'),
      dataIndex: 'example',
      key: 'example',
      render: (example: string) => <Text code>{example}</Text>
    }
  ];

  const handleUpload = async (file: File): Promise<void> => {
    setCurrentStep(1);

    try {
      const result = await importTyFromExcel(file).unwrap();

      setImportResult(result);
      setCurrentStep(2);

      if (result.success) {
        message.success(t('tyImport.messages.importSuccess', { message: result.message, count: result.created_count }));
      } else {
        message.warning(t('tyImport.messages.importWarning', { message: result.message }));
      }
    } catch (error) {
      console.error('Import error:', error);
      message.error(t('tyImport.messages.importError'));
      setCurrentStep(0);
    }
  };

  const uploadProps: UploadProps = {
    name: 'excel_file',
    multiple: false,
    accept: '.xlsx,.xls',
    beforeUpload: (file: File) => {
      const validation = validateExcelFile(file);

      if (!validation.isValid) {
        message.error(validation.error);
        return false;
      }

      setUploadedFile({
        uid: file.name,
        name: file.name,
        size: file.size,
        type: file.type,
        originFileObj: file
      } as UploadFile);

      handleUpload(file);
      return false;
    },
    showUploadList: false
  };

  const handleReset = (): void => {
    setCurrentStep(0);
    setUploadedFile(null);
    setImportResult(null);
  };

  const handleDownloadErrorReport = (): void => {
    if (importResult?.errors && importResult.errors.length > 0) {
      downloadErrorReport(importResult.errors, `import_errors_${Date.now()}.txt`);
      message.success(t('tyImport.messages.reportDownloaded'));
    }
  };

  return (
    <div>
      <Title level={2}>
        <FileExcelOutlined style={{ marginRight: '12px', color: '#52c41a' }} />
        {t('tyImport.title')}
      </Title>

      <Steps
        current={currentStep}
        style={{ marginBottom: '32px' }}
        items={[
          {
            title: t('tyImport.steps.selectFile'),
            description: t('tyImport.steps.selectFileDesc'),
            icon: <UploadOutlined />
          },
          {
            title: t('tyImport.steps.processing'),
            description: t('tyImport.steps.processingDesc'),
            icon: isImporting ? undefined : <CheckCircleOutlined />
          },
          {
            title: t('tyImport.steps.result'),
            description: t('tyImport.steps.resultDesc'),
            icon: <InfoCircleOutlined />
          }
        ]}
      />

      {currentStep === 0 && (
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={12}>
            <Card title={t('tyImport.upload.cardTitle')}>
              <Upload.Dragger {...uploadProps} style={{ padding: '40px 20px' }}>
                <p className='ant-upload-drag-icon'>
                  <FileExcelOutlined style={{ fontSize: '48px', color: '#52c41a' }} />
                </p>
                <p className='ant-upload-text'>
                  <Text strong>{t('tyImport.upload.dragTextStrong')}</Text>
                </p>
                <p className='ant-upload-hint'>{t('tyImport.upload.dragHint')}</p>
              </Upload.Dragger>

              <Alert
                message={t('tyImport.upload.alertTitle')}
                description={t('tyImport.upload.alertDescription')}
                type='info'
                showIcon
                style={{ marginTop: '16px' }}
              />
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title={t('tyImport.requirements.cardTitle')}>
              <List
                size='small'
                dataSource={[
                  t('tyImport.requirements.list.item1'),
                  t('tyImport.requirements.list.item2'),
                  t('tyImport.requirements.list.item3'),
                  t('tyImport.requirements.list.item4'),
                  t('tyImport.requirements.list.item5'),
                  t('tyImport.requirements.list.item6')
                ]}
                renderItem={(item) => (
                  <List.Item>
                    <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
                    <Text>{item}</Text>
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>
      )}

      {currentStep === 1 && (
        <Card title={t('tyImport.processingFile.cardTitle')}>
          <Space direction='vertical' style={{ width: '100%' }} size='large'>
            {uploadedFile && (
              <Alert
                message={
                  <Space>
                    <Text>{t('tyImport.processingFile.processingFile', { name: uploadedFile.name })}</Text>
                    <Text type='secondary'>{t('tyImport.processingFile.size', { size: formatFileSize(uploadedFile.size || 0) })}</Text>
                  </Space>
                }
                type='info'
                showIcon
              />
            )}

            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Spin size='large' />
              <div style={{ marginTop: '16px' }}>
                <Text>{isImporting ? t('tyImport.processingFile.importing') : t('tyImport.processingFile.preparing')}</Text>
              </div>
            </div>
          </Space>
        </Card>
      )}

      {currentStep === 2 && importResult && (
        <Space direction='vertical' style={{ width: '100%' }} size='large'>
          <Card title={t('tyImport.results.cardTitle')}>
            <Row gutter={[16, 16]}>
              <Col xs={12} sm={8}>
                <Card size='small' style={{ textAlign: 'center' }}>
                  <Title level={3} style={{ color: '#52c41a', margin: 0 }}>
                    {importResult.created_count}
                  </Title>
                  <Text type='secondary'>{t('tyImport.results.createdTu')}</Text>
                </Card>
              </Col>
              <Col xs={12} sm={8}>
                <Card size='small' style={{ textAlign: 'center' }}>
                  <Title level={3} style={{ color: '#1890ff', margin: 0 }}>
                    {importResult.created_tus.length}
                  </Title>
                  <Text type='secondary'>{t('tyImport.results.createdIds')}</Text>
                </Card>
              </Col>
              <Col xs={12} sm={8}>
                <Card size='small' style={{ textAlign: 'center' }}>
                  <Title level={3} style={{ color: importResult.errors.length > 0 ? '#ff4d4f' : '#52c41a', margin: 0 }}>
                    {importResult.errors.length}
                  </Title>
                  <Text type='secondary'>{t('tyImport.results.errors')}</Text>
                </Card>
              </Col>
            </Row>

            <Divider />

            <Space wrap>
              <Tag color='success' icon={<CheckCircleOutlined />}>
                {importResult.success ? t('tyImport.results.successTag') : t('tyImport.results.errorTag')}
              </Tag>
              {importResult.created_tus.length > 0 && (
                <Tag color='processing'>
                  {t('tyImport.results.createdTuPrefix')}: {importResult.created_tus.slice(0, 3).join(', ')}
                  {importResult.created_tus.length > 3 && '...'}
                </Tag>
              )}
              <Tag color='blue'>{t('tyImport.results.archivedTag')}</Tag>
            </Space>
          </Card>

          {importResult.created_tus.length > 0 && (
            <Card
              title={
                <Space>
                  <CheckCircleOutlined style={{ color: '#52c41a' }} />
                  <span>{t('tyImport.results.createdTuCardTitle', { count: importResult.created_tus.length })}</span>
                </Space>
              }
            >
              <div style={{ marginBottom: '16px' }}>
                <Text strong>{t('tyImport.results.createdIdsPrefix')}</Text>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {importResult.created_tus.map((tuId) => (
                  <Tag key={tuId} color='green' style={{ margin: 0 }}>
                    {t('tyImport.results.tuLabel', { id: tuId })}
                  </Tag>
                ))}
              </div>

              {importResult.created_tus.length > 20 && (
                <div style={{ marginTop: '12px' }}>
                  <Text type='secondary'>{t('tyImport.results.showingFirst', { count: importResult.created_count })}</Text>
                </div>
              )}
            </Card>
          )}

          {importResult.errors.length > 0 && (
            <Card
              title={
                <Space>
                  <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
                  <span>{t('tyImport.errors.cardTitle', { count: importResult.errors.length })}</span>
                </Space>
              }
              extra={
                <Button icon={<DownloadOutlined />} onClick={handleDownloadErrorReport} size='small'>
                  {t('tyImport.errors.downloadReport')}
                </Button>
              }
            >
              <Alert
                message={t('tyImport.errors.alertTitle')}
                description={t('tyImport.errors.alertDesc')}
                type='warning'
                showIcon
                style={{ marginBottom: '16px' }}
              />

              <Table
                dataSource={importResult.errors}
                columns={errorColumns}
                pagination={{ pageSize: 10, showSizeChanger: true }}
                size='small'
                rowKey={(_, index) => `error-${index}`}
                scroll={{ x: 400 }}
              />
            </Card>
          )}

          <Card>
            <Space>
              <Button type='primary' onClick={handleReset}>
                {t('tyImport.actions.importAnother')}
              </Button>
              <Button onClick={() => (window.location.href = '/dashboard/ty/archive')}>{t('tyImport.actions.goToArchive')}</Button>
            </Space>
          </Card>
        </Space>
      )}

      <Card title={t('tyImport.excelFormat.cardTitle')} style={{ marginTop: '32px' }} type='inner'>
        <Paragraph>
          <Text strong>{t('tyImport.excelFormat.intro')}</Text>
        </Paragraph>

        <Table dataSource={excelColumnsData} columns={formatColumns} pagination={false} size='small' rowKey='key' />
      </Card>
    </div>
  );
};
