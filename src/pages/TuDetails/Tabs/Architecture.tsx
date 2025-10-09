import { FC, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Button, Card, Col, Input, message, Row, Typography } from 'antd';
import { IFileFolderFolder } from 'types/entities';
import customFileImg from 'assets/images/Architecture/customFile.png';
import fileImg from 'assets/images/Architecture/file.png';
import moreFileImg from 'assets/images/Architecture/more-file.png';

import { useCreateFilefolderMutation } from 'api/FileFolder.api';
import { Modal } from 'ui/Modal';

const { Title } = Typography;

interface IProps {
  documentsRequire: IFileFolderFolder['required'];
  documentsCustom: IFileFolderFolder['custom'];
  categoryId: string;
}

export const Architecture: FC<IProps> = ({ documentsRequire, documentsCustom, categoryId }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [createFolder, { isLoading, isSuccess, isError }] = useCreateFilefolderMutation();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [folderTitle, setFolderTitle] = useState('');

  const handleDownloadClick = ({ folder_id, folderName }: { folder_id: string; folderName: string }) => {
    navigate(`/dashboard/folder-detail/${folder_id}/${id}`, { state: { folderName: folderName } });
  };

  const handleCreateDocument = () => {
    createFolder({ title: folderTitle, category: categoryId, ty: id });
  };

  useEffect(() => {
    if (isSuccess) {
      setIsModalVisible(false);
      setFolderTitle('');
      message.success(t('architecture.messages.created'));
    }
    if (isError) {
      message.error(t('architecture.messages.createError'));
    }
  }, [isError, isSuccess, t]);

  return (
    <>
      <div style={{ marginTop: 24 }}>
        <Title level={4}>{t('architecture.titles.documentsToUpload')}</Title>
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          {documentsRequire.map((doc) => (
            <Col key={doc.id}>
              <Card
                style={{
                  textAlign: 'center',
                  borderRadius: 8,
                  border: '1px solid #eee'
                }}
              >
                <div
                  style={{
                    height: 160,
                    width: 208,
                    borderRadius: 8,
                    backgroundColor: '#E8F5E9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 16
                  }}
                >
                  <img src={fileImg} alt='' style={{ width: '100%', height: '100%' }} />
                </div>
                <Title level={5} style={{ marginBottom: 8, fontSize: 12, color: '#737379' }}>
                  {doc.title}
                </Title>
                <Button
                  onClick={() => handleDownloadClick({ folder_id: doc.id, folderName: doc.title })}
                  color='default'
                  variant='outlined'
                  style={{ width: '100%', borderRadius: 6 }}
                >
                  {t('common.upload')}
                </Button>
              </Card>
            </Col>
          ))}
        </Row>

        <div style={{ marginTop: 48 }}>
          <Title level={4}>{t('architecture.titles.additionalDocuments')}</Title>
          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Card
              style={{
                textAlign: 'center',
                borderRadius: 8,
                border: '1px solid #eee',
                maxHeight: 200
              }}
            >
              <div
                style={{
                  height: 104,
                  width: 208,
                  borderRadius: 8,
                  backgroundColor: '#E8F5E9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16
                }}
              >
                <img src={moreFileImg} alt='' style={{ width: '100%', height: '100%' }} />
              </div>
              <Title level={5} style={{ marginBottom: 8, fontSize: 12, color: '#737379' }}></Title>
              <Button onClick={() => setIsModalVisible(true)} style={{ width: '100%', borderRadius: 6 }}>
                {t('architecture.buttons.createDocument')}
              </Button>
            </Card>
            {documentsCustom.map((doc) => (
              <Col key={doc.id}>
                <Card
                  style={{
                    textAlign: 'center',
                    borderRadius: 8,
                    border: '1px solid #eee'
                  }}
                >
                  <div
                    style={{
                      height: 160,
                      width: 208,
                      borderRadius: 8,
                      backgroundColor: '#E8F5E9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 16
                    }}
                  >
                    <img src={customFileImg} alt='' style={{ width: '100%', height: '100%' }} />
                  </div>
                  <Title level={5} style={{ marginBottom: 8, fontSize: 12, color: '#737379' }}>
                    {doc.title}
                  </Title>
                  <Button
                    onClick={() => handleDownloadClick({ folder_id: doc.id, folderName: doc.title })}
                    color='default'
                    variant='outlined'
                    style={{ width: '100%', borderRadius: 6 }}
                  >
                    {t('common.upload')}
                  </Button>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
        <Modal
          title={t('architecture.titles.createDocument')}
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={
            <Row justify='end' gutter={16}>
              <Col>
                <Button onClick={() => setIsModalVisible(false)}>{t('tuRejectModal.buttons.back')}</Button>
              </Col>
              <Col>
                <Button loading={isLoading} type='primary' onClick={() => handleCreateDocument()}>
                  {t('architecture.buttons.create')}
                </Button>
              </Col>
            </Row>
          }
          width={600}
        >
          <Input placeholder={t('architecture.inputs.documentName')} onChange={(e) => setFolderTitle(e.target.value)} />
        </Modal>
      </div>
    </>
  );
};
