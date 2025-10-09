import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Form, Input, List, Modal, Select, Space, Upload, UploadFile, UploadProps } from 'antd';
import type { UploadChangeParam } from 'antd/es/upload';
import { CloseCircleTwoTone, FileOutlined, UploadOutlined } from '@ant-design/icons';

import { type RefusalBody, useGetRefusalCausesQuery } from 'api/Refusal.api';

interface MyModalProps {
  visible: boolean;
  onClose: () => void;
  onReject: (data: RefusalBody) => void;
}

export const MyModal: FC<MyModalProps> = ({ visible, onClose, onReject }) => {
  const refuseQuery = useGetRefusalCausesQuery();
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [uploadFileList, setUploadFileList] = useState<UploadFile<File>[]>([]);

  const handleUploadChange: UploadProps['onChange'] = (info: UploadChangeParam<UploadFile<File>>) => {
    setUploadFileList(info.fileList);
  };

  const handleRemoveFile = (file: UploadFile<File>) => {
    setUploadFileList((prev) => prev.filter((f) => f.uid !== file.uid));
  };

  const handleSubmit = () => {
    const values = form.getFieldsValue();
    onReject(values);
    onClose();
    form.resetFields();
    setUploadFileList([]);
  };

  const handleCancel = () => {
    onClose();
    form.resetFields();
    setUploadFileList([]);
  };

  return (
    <Modal open={visible} title={t('tuRejectModal.title')} onCancel={handleCancel} footer={null}>
      <Form form={form} layout='vertical'>
        <Form.Item name='reason' label={t('tuRejectModal.labels.reason')} initialValue={t('tuRejectModal.defaultReason')}>
          <Select placeholder={t('tuRejectModal.placeholders.reason')}>
            {refuseQuery.data?.results.map((cause) => (
              <Select.Option key={cause.id} value={cause.id}>
                {cause.title}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name='comment' label={t('tuRejectModal.labels.comment')}>
          <Input.TextArea rows={4} placeholder={t('tuRejectModal.placeholders.comment')} />
        </Form.Item>

        <Upload multiple showUploadList={false} fileList={uploadFileList} beforeUpload={() => false} onChange={handleUploadChange}>
          <Button icon={<UploadOutlined />} style={{ marginBottom: 16 }}>
            {t('tuRejectModal.buttons.upload')}
          </Button>
        </Upload>

        {uploadFileList.length > 0 && (
          <List
            bordered
            dataSource={uploadFileList}
            renderItem={(file) => (
              <List.Item
                key={file.uid}
                actions={[
                  <CloseCircleTwoTone twoToneColor='#E63A3A' style={{ cursor: 'pointer' }} onClick={() => handleRemoveFile(file)} />
                ]}
              >
                <Space>
                  <FileOutlined style={{ color: '#327BE8' }} />
                  <div>{file.name}</div>
                </Space>
              </List.Item>
            )}
            style={{ marginBottom: 16 }}
          />
        )}

        <div style={{ textAlign: 'right' }}>
          <Button style={{ marginRight: 8 }} onClick={handleCancel}>
            {t('tuRejectModal.buttons.back')}
          </Button>
          <Button type='primary' danger onClick={handleSubmit}>
            {t('tuRejectModal.buttons.reject')}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};
