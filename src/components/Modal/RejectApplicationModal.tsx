import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Form, Input, Modal, Select, Space, Typography, Upload } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import { CloseOutlined, UploadOutlined } from '@ant-design/icons';

import { RefusalBody, useGetRefusalCausesQuery } from 'api/Refusal.api';

const { TextArea } = Input;
const { Text } = Typography;

interface RejectApplicationModalProps {
  open: boolean;
  onCancel: () => void;
  onReject: (data: RefusalBody) => void;
}

export const RejectApplicationModal: React.FC<RejectApplicationModalProps> = ({ open, onCancel, onReject }) => {
  const [form] = Form.useForm<RefusalBody>();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const refuseQuery = useGetRefusalCausesQuery();
  const { t } = useTranslation();

  const handleFinish = (values: RefusalBody) => {
    const adaptedFiles = fileList.map((f) => f.originFileObj).filter(Boolean) as File[];
    onReject({
      causes_ids: values.causes_ids,
      comment: values.comment || '',
      refusal_files: [
        ...adaptedFiles.map((f) => ({
          file: f
        }))
      ]
    });

    // Сброс
    form.resetFields();
    setFileList([]);
  };

  const handleCancel = () => {
    form.resetFields();
    setFileList([]);
    onCancel();
  };

  const handleFileUpload = (info: { fileList: UploadFile[] }) => {
    setFileList(info.fileList);
  };

  const handleFileRemove = (file: UploadFile) => {
    const newFileList = fileList.filter((item) => item.uid !== file.uid);
    setFileList(newFileList);
  };

  const formatFileSize = (size: number) => {
    return `${(size / 1024 / 1024).toFixed(1)} MB`;
  };

  const renderFileItem = (file: UploadFile) => (
    <div
      key={file.uid}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '8px 0',
        borderBottom: '1px solid #f0f0f0'
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          minWidth: 32,
          backgroundColor: '#ff4d4f',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          fontWeight: 'bold',
          borderRadius: 4
        }}
      >
        {file.originFileObj && file.originFileObj.name.split('.').pop()}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '14px', color: '#000' }}>{file.name}</div>
        <div style={{ fontSize: '12px', color: '#999' }}>{file.size ? formatFileSize(file.size) : ''}</div>
      </div>
      <Button
        type='text'
        icon={<CloseOutlined />}
        size='small'
        onClick={() => handleFileRemove(file)}
        style={{
          color: '#999',
          minWidth: 'auto',
          padding: 4
        }}
      />
    </div>
  );

  const uploadProps = {
    beforeUpload: () => false,
    onChange: handleFileUpload,
    multiple: true,
    showUploadList: false,
    accept: '.pdf,.doc,.docx'
  };

  const refusals = useMemo(
    () =>
      refuseQuery.data?.results.map((r) => ({
        value: r.id.toString(),
        label: r.title
      })) || [],
    [refuseQuery.data]
  );

  return (
    <Modal
      title={t('tuRejectModal.title')}
      open={open}
      onCancel={handleCancel}
      width={600}
      footer={
        <Space>
          <Button size='large' onClick={handleCancel}>
            {t('tuRejectModal.buttons.back')}
          </Button>
          <Button size='large' type='primary' danger htmlType='submit' form='rejectForm'>
            {t('tuRejectModal.buttons.reject')}
          </Button>
        </Space>
      }
      destroyOnHidden
    >
      <Form id='rejectForm' form={form} layout='vertical' onFinish={handleFinish}>
        <Form.Item
          label={t('tuRejectModal.labels.reason')}
          name='causes_ids'
          rules={[
            {
              required: true,
              message: t('common.required')
            }
          ]}
        >
          <Select
            mode='multiple'
            size='large'
            placeholder={t('tuRejectModal.placeholders.reason')}
            style={{ width: '100%' }}
            options={refusals}
          />
        </Form.Item>

        <Form.Item label={t('tuRejectModal.labels.comment')} name='comment'>
          <TextArea placeholder={t('tuRejectModal.placeholders.comment')} rows={4} style={{ resize: 'none' }} />
        </Form.Item>
      </Form>

      <div style={{ marginBottom: 16 }}>
        <Text strong style={{ marginBottom: 8, display: 'block' }}>
          {t('tuRejectModal.buttons.upload')}
        </Text>
        <Upload {...uploadProps} fileList={fileList}>
          <Button
            size='large'
            icon={<UploadOutlined />}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            {t('tuRejectModal.buttons.upload')}
          </Button>
        </Upload>
        <div style={{ marginTop: 12 }}>{fileList.map((file) => renderFileItem(file))}</div>
      </div>
    </Modal>
  );
};
