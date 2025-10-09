import { FC, useEffect, useState } from 'react';
import { Button, Col, DatePicker, Form, Input, InputNumber, message, Modal, Row, Select, Space, Upload, UploadFile } from 'antd';
import type { UploadChangeParam } from 'antd/es/upload';
import { UploadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

import { useCreatePaymentMutation } from 'api/Accounting.api';
import { t } from 'i18next';
const { Option } = Select;

interface IProps {
  visible: boolean;
  onClose: () => void;
  invoiceId: string;
}

interface IFormValues {
  payment_number: string;
  payment_date: dayjs.Dayjs;
  amount: number;
  source: string;
  status: 'received';
}

export const AddPaymentModal: FC<IProps> = ({ visible, onClose, invoiceId }) => {
  const [form] = Form.useForm<IFormValues>();
  const [createPayment, { isLoading }] = useCreatePaymentMutation();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  useEffect(() => {
    if (visible) {
      form.setFieldsValue({
        payment_date: dayjs(),
        status: 'received'
      });
      setFileList([]);
      setUploadedFile(null);
    }
  }, [visible, form]);

  const handleSubmit = async (values: IFormValues) => {
    try {
      const formData = new FormData();
      formData.append('payment_number', values.payment_number);
      formData.append('payment_date', values.payment_date.format('YYYY-MM-DD'));
      formData.append('amount', values.amount.toString());
      formData.append('source', values.source);
      formData.append('status', values.status);
      formData.append('invoice', invoiceId);

      if (uploadedFile) {
        formData.append('receipt_file', uploadedFile);
      }

      await createPayment(formData).unwrap();
      message.success(t('paymentsModal.messages.success'));
      handleCancel();
    } catch (error) {
      console.error('Ошибка:', error);
      message.error(t('paymentsModal.messages.error'));
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setFileList([]);
    setUploadedFile(null);
    onClose();
  };

  const handleFileChange = (info: UploadChangeParam<UploadFile>) => {
    setFileList(info.fileList.slice(-1));

    if (info.fileList.length > 0) {
      const file = info.fileList[0]?.originFileObj;
      if (file) {
        setUploadedFile(file);
      }
    } else {
      setUploadedFile(null);
    }
  };

  const beforeUpload = (file: File) => {
    const isImage = file.type.startsWith('image/');
    const isPDF = file.type === 'application/pdf';
    const isDoc = file.type.includes('document') || file.type.includes('spreadsheet');

    if (!isImage && !isPDF && !isDoc) {
      message.error(t('paymentsModal.messages.fileTypeError'));
      return Upload.LIST_IGNORE;
    }

    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      message.error(t('paymentsModal.messages.fileSizeError'));
      return Upload.LIST_IGNORE;
    }

    return false;
  };

  return (
    <Modal title={t('paymentsModal.title')} open={visible} onCancel={handleCancel} width={600} footer={null}>
      <Form form={form} layout='vertical' onFinish={handleSubmit} style={{ marginTop: 16 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name='payment_number'
              label={t('paymentsModal.labels.paymentNumber')}
              rules={[{ required: true, message: t('paymentsModal.validation.required') }]}
            >
              <Input placeholder={t('paymentsModal.placeholders.paymentNumber')} />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name='payment_date'
              label={t('paymentsModal.labels.paymentDate')}
              rules={[{ required: true, message: t('paymentsModal.validation.required') }]}
            >
              <DatePicker style={{ width: '100%' }} format='DD.MM.YYYY' placeholder={t('paymentsModal.placeholders.date')} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name='amount'
              label={t('paymentsModal.labels.amount')}
              rules={[
                { required: true, message: t('paymentsModal.validation.required') },
                { type: 'number', min: 0.01, message: t('paymentsModal.validation.amountPositive') }
              ]}
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder={t('paymentsModal.placeholders.amount')}
                step={0.01}
                min={0}
                addonAfter={t('tuDetails.currency')}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name='source'
              label={t('paymentsModal.labels.source')}
              rules={[{ required: true, message: t('paymentsModal.validation.required') }]}
            >
              <Input placeholder={t('paymentsModal.placeholders.source')} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name='status'
          label={t('paymentsModal.labels.status')}
          rules={[{ required: true, message: t('paymentsModal.validation.required') }]}
        >
          <Select placeholder={t('paymentsModal.placeholders.status')}>
            <Option value='received'>{t('protocolDetail.payment.status.received')}</Option>
          </Select>
        </Form.Item>

        <Form.Item label={t('paymentsModal.labels.optionalReceiptFile')}>
          <Upload
            fileList={fileList}
            beforeUpload={beforeUpload}
            onChange={handleFileChange}
            maxCount={1}
            accept='image/*,.pdf,.doc,.docx,.xls,.xlsx'
          >
            <Button icon={<UploadOutlined />}>
              {fileList.length > 0 ? t('paymentsModal.buttons.replaceFile') : t('paymentsModal.buttons.uploadReceipt')}
            </Button>
          </Upload>
          {fileList.length > 0 && (
            <div style={{ marginTop: 8, color: '#52c41a' }}>
              {t('paymentsModal.messages.fileSelectedPrefix')} {fileList[0].name}
            </div>
          )}
        </Form.Item>

        <Form.Item style={{ marginTop: 24 }}>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={handleCancel}>{t('paymentsModal.buttons.cancel')}</Button>
            <Button type='primary' htmlType='submit' loading={isLoading}>
              {t('paymentsModal.buttons.submit')}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};
