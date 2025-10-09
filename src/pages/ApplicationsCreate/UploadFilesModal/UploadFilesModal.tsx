import { FC, useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Form, Upload } from 'antd';
import { UploadChangeParam, UploadFile, UploadProps } from 'antd/es/upload';
import { CloseOutlined, CloudDownloadOutlined } from '@ant-design/icons';
import { Modal } from 'common/ui';
import UploadIcon from 'assets/icons/file-upload-container.svg?react';
import './styles.scss';

import clsx from 'clsx';

interface IProps {
  isOpen: boolean;
  onClose: () => void;
  onFilesSelected: (files: UploadFile[]) => void;
  currentFiles: UploadFile[];
}

export const UploadFilesModal: FC<IProps> = ({ isOpen, currentFiles, onClose, onFilesSelected }) => {
  const { t } = useTranslation();
  const [fileList, setFileList] = useState<UploadFile[]>(currentFiles);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const uploadRef = useRef<any>(null);

  const handleChange: UploadProps['onChange'] = ({ fileList }) => {
    setFileList(fileList);
  };

  const handleOk = () => {
    onFilesSelected(fileList);
    onClose();
  };

  const handleClose = () => {
    onClose();
    if (currentFiles.length === 0) {
      setFileList([]);
    }
  };

  const handleDeleteFile = useCallback(
    (file: UploadFile, removeAction: () => void) => {
      removeAction();
      const updatedFileList = fileList.filter((item) => item.uid !== file.uid);
      setFileList(updatedFileList);
      onFilesSelected(updatedFileList);
    },
    [fileList, onFilesSelected]
  );

  const triggerUpload = (e: React.MouseEvent<HTMLElement>) => {
    if (uploadRef.current && uploadRef.current.upload && uploadRef.current.upload.uploader) {
      uploadRef.current.upload.uploader.onClick(e);
    }
  };

  const formatFileSize = useCallback(
    (size?: number): string => {
      if (!size) return '';
      if (size < 1024) return `${size} ${t('common.bytes')}`;
      if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
      return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    },
    [t]
  );

  return (
    <Modal
      open={isOpen}
      title={t('applicationsCreate.uploadModal.title')}
      onCancel={handleClose}
      footer={[
        <div className={clsx('modal-footer', { 'has-files': fileList.length !== 0 })} key='footer'>
          {fileList.length !== 0 && (
            <Button onClick={triggerUpload} icon={<CloudDownloadOutlined />}>
              {t('common.uploadFile')}
            </Button>
          )}

          <div className='modal-footer-buttons'>
            <Button color='default' variant='filled' key='back' onClick={handleClose}>
              {t('common.back')}
            </Button>

            <Button key='submit' type='primary' onClick={handleOk} disabled={fileList.length === 0}>
              {t('common.upload')}
            </Button>
          </div>
        </div>
      ]}
      destroyOnHidden={false}
      className='upload-files-modal'
    >
      <Form.Item
        name='entity'
        getValueFromEvent={(e: UploadChangeParam<UploadFile>) => e && e.fileList}
        rules={[{ required: true, message: t('applicationsCreate.uploadModal.validation.attachFile') }]}
      >
        <Upload
          listType='picture'
          fileList={fileList}
          onChange={handleChange}
          ref={uploadRef}
          itemRender={(_, file, _files, { remove }) => {
            const fileSizeMB = formatFileSize(file.size);
            const extension = file.name.split('.').pop()?.toUpperCase();

            return (
              <div className='custom-upload-item'>
                <div className='file-details'>
                  <div className='file-icon'>{extension}</div>
                  <div className='file-info'>
                    <div className='file-name'>{file.name}</div>
                    <div className='file-size'>{fileSizeMB} </div>
                  </div>
                </div>

                <div className='close-icon' onClick={() => handleDeleteFile(file, remove)}>
                  <CloseOutlined />
                </div>
              </div>
            );
          }}
          beforeUpload={() => false}
          multiple={true}
          className='custom-upload'
          accept='*'
        >
          {fileList.length === 0 && (
            <div className='ant-upload-drag-container'>
              <p className='ant-upload-drag-icon'>
                <UploadIcon style={{ fontSize: 40, color: '#999' }} />
              </p>
              <p>{t('applicationsCreate.uploadModal.dropHint')}</p>
              <Button icon={<CloudDownloadOutlined />}>{t('common.uploadFile')}</Button>
            </div>
          )}
        </Upload>
      </Form.Item>
    </Modal>
  );
};
