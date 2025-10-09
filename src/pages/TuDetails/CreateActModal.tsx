import { FC, useMemo, useState } from 'react';
import { Button, message, Modal, Space, Typography, Upload, UploadFile, UploadProps } from 'antd';
import type { UploadChangeParam } from 'antd/es/upload';
import { UploadOutlined } from '@ant-design/icons';
import { IActEnum } from 'types/common';

import { useCreateActTyMutation } from 'api/Ty.api';
import { t } from 'i18next';

const { Text } = Typography;

interface CreateActModalProps {
  open: boolean;
  tyId: string;
  status: IActEnum;
  onClose: () => void;
  onCreated?: () => void;
}

const CreateActModal: FC<CreateActModalProps> = ({ open, tyId, status, onClose, onCreated }) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [createAct, { isLoading: isCreating }] = useCreateActTyMutation();

  const hasFile = useMemo(() => fileList.length > 0 && fileList[0]?.originFileObj instanceof File, [fileList]);

  const onUploadChange: UploadProps['onChange'] = (info: UploadChangeParam<UploadFile>) => {
    // ограничим одним файлом
    setFileList(info.fileList.slice(-1));
  };

  const handleOk = async () => {
    try {
      if (!hasFile) {
        message.warning(t('tuDetails.act.messages.fileRequired', 'Выберите файл акта'));
        return;
      }
      const raw = fileList[0].originFileObj as File;
      console.log('[ACT] submit payload', {
        ty: tyId,
        status,
        fileInfo: { name: raw.name, size: raw.size, type: raw.type }
      });

      await createAct({ ty: tyId, status, file: raw }).unwrap();

      message.success(t('tuDetails.act.messages.uploadSuccess', 'Акт загружен'));
      setFileList([]);
      onClose();
      onCreated?.();
    } catch {
      // ошибки сети/валидации обработаются RTKQ/antd
    }
  };

  const handleCancel = () => {
    setFileList([]);
    onClose();
  };

  return (
    <Modal
      open={open}
      title={t('tuDetails.act.modal.title', 'Загрузить акт')}
      onOk={handleOk}
      onCancel={handleCancel}
      okText={t('common.upload')}
      cancelText={t('common.cancel')}
      confirmLoading={isCreating}
      destroyOnClose
    >
      <Space direction='vertical' size={12} style={{ width: '100%' }}>
        <Text type='secondary'>{t('tuDetails.act.modal.hint', { status })}</Text>
        <Upload multiple={false} beforeUpload={() => false} onChange={onUploadChange} fileList={fileList} maxCount={1}>
          <Button icon={<UploadOutlined />}>{t('common.uploadFile')}</Button>
        </Upload>
      </Space>
    </Modal>
  );
};

export default CreateActModal;
