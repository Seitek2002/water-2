import { FC, useEffect, useMemo, useState } from 'react';
import { useLocation, useParams } from 'react-router';
import { Button, Col, List, message, Row, Space, Tabs, Typography, Upload, UploadFile, UploadProps } from 'antd';
import { UploadChangeParam } from 'antd/es/upload';
import Dragger from 'antd/es/upload/Dragger';
import { CloseCircleTwoTone, CloudDownloadOutlined, FileTextOutlined, InboxOutlined } from '@ant-design/icons';
import { Modal, Table } from 'common/ui';
import { DashboardLayout } from 'components/DashboardLayout';
import { getColumns } from './FolderDetail.helpers';

import { useGetFilefolderFilesQuery, useUploadFileMutation } from 'api/FileFolder.api';
import { t } from 'i18next';

interface IProps {
  title: string;
}

const { TabPane } = Tabs;
const { Text } = Typography;

export const FolderDetail: FC<IProps> = () => {
  const params = useLocation();

  const { folderId, tyId } = useParams<{ folderId: string; tyId: string }>();
  const filesQuery = useGetFilefolderFilesQuery({ folder_id: folderId || '', ty_id: tyId || '' });
  const [uploadFiles, { isSuccess, isLoading, isError }] = useUploadFileMutation();
  const [activeTab, setActiveTab] = useState('1');
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [filesList, setFilesList] = useState<UploadFile[]>([]);

  const columns = useMemo(
    () =>
      getColumns({
        tyId,
        onClick: (record, action) => {
          switch (action) {
            case 'download':
              window.open(record.file);
              break;
            case 'delete':
              message.info(t('common.inDevelopment'));
              break;
          }
        }
      }),
    [tyId]
  );

  const data = useMemo(() => {
    const list = filesQuery.data?.results || [];
    return list;
  }, [filesQuery.data]);

  const handleCancelAdd = () => {
    setFilesList([]);
    setIsAddModalVisible(false);
  };

  const handleAddConfirm = () => {
    console.log('Добавить файлы:', filesList);
    if (filesList.length > 0) {
      uploadFiles({ folder: folderId || '', files: filesList.map((file) => file.originFileObj as File), ty: tyId || '' });
    }
    setFilesList([]);
    setIsAddModalVisible(false);
  };

  const handleUploadChange: UploadProps['onChange'] = ({ fileList: newFileList }: UploadChangeParam<UploadFile>) => {
    // Merge newly selected files with the existing list (keep unique by uid)
    setFilesList((prev) => {
      const map = new Map(prev.map((f) => [f.uid, f]));
      newFileList.forEach((f) => {
        map.set(f.uid, f);
      });
      return Array.from(map.values());
    });
  };

  const removeFile = (uid: string) => {
    setFilesList((prev) => prev.filter((f) => f.uid !== uid));
  };

  useEffect(() => {
    if (isSuccess) {
      setIsAddModalVisible(false);
      setFilesList([]);
      message.success(t('folderDetail.messages.uploadSuccess'));
    }
    if (isError) {
      message.error(t('folderDetail.messages.uploadError'));
    }
  }, [isError, isSuccess]);

  return (
    <DashboardLayout title={params.state.folderName}>
      <Row justify='end' style={{ marginBottom: 16 }}>
        <Button type='primary' icon={<CloudDownloadOutlined />} onClick={() => setIsAddModalVisible(true)}>
          {t('common.upload')}
        </Button>
      </Row>
      <Tabs activeKey={activeTab} onChange={(key) => setActiveTab(key)}>
        <TabPane tab={t('folderDetail.tabs.uploaded')} key='1'>
          <Table columns={columns} dataSource={data} rowKey='id' pagination={false} />
        </TabPane>
      </Tabs>
      <Modal title={t('architectureDetails.titles.uploadDocument')} open={isAddModalVisible} onCancel={handleCancelAdd} footer={null}>
        {filesList.length === 0 ? (
          <>
            <Dragger
              multiple
              fileList={filesList}
              onChange={handleUploadChange}
              beforeUpload={() => false}
              showUploadList={false}
              style={{ marginBottom: 16 }}
            >
              <p className='ant-upload-drag-icon'>
                <InboxOutlined style={{ fontSize: 40, color: '#999' }} />
              </p>
              <p>{t('applicationsCreate.uploadModal.dropHint')}</p>
              <Button icon={<CloudDownloadOutlined />}>{t('common.uploadFile')}</Button>
            </Dragger>
            <Row justify='end' gutter={8}>
              <Col>
                <Button onClick={handleCancelAdd}>{t('common.back')}</Button>
              </Col>
              <Col>
                <Button type='primary' disabled>
                  {t('common.upload')}
                </Button>
              </Col>
            </Row>
          </>
        ) : (
          <>
            <Text style={{ display: 'block', marginBottom: 8 }}>{t('common.selectedFiles', { count: filesList.length })}</Text>
            <List
              bordered
              dataSource={filesList}
              renderItem={(file) => (
                <List.Item
                  key={file.uid}
                  actions={[
                    <CloseCircleTwoTone twoToneColor='#E63A3A' style={{ cursor: 'pointer' }} onClick={() => removeFile(file.uid)} />
                  ]}
                >
                  <Space size='small'>
                    <FileTextOutlined style={{ fontSize: 24, color: '#999' }} />
                    <div>
                      <div>{file.name}</div>
                      <Text type='secondary' style={{ fontSize: 12 }}>
                        {file.size
                          ? file.size < 1024
                            ? `${file.size} ${t('common.bytes')}`
                            : file.size < 1024 * 1024
                              ? `${(file.size / 1024).toFixed(1)} KB`
                              : `${(file.size / (1024 * 1024)).toFixed(1)} MB`
                          : ''}
                      </Text>
                    </div>
                  </Space>
                </List.Item>
              )}
              style={{ marginBottom: 16 }}
            />
            <Upload multiple fileList={[]} showUploadList={false} beforeUpload={() => false} onChange={handleUploadChange}>
              <Button icon={<CloudDownloadOutlined />}>{t('common.uploadMore')}</Button>
            </Upload>
            <Row justify='end' gutter={8} style={{ marginTop: 16 }}>
              <Col>
                <Button onClick={handleCancelAdd}>{t('common.back')}</Button>
              </Col>
              <Col>
                <Button loading={isLoading} type='primary' onClick={handleAddConfirm}>
                  {t('filterBar.add')}
                </Button>
              </Col>
            </Row>
          </>
        )}
      </Modal>
    </DashboardLayout>
  );
};
