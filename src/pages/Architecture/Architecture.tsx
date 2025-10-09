import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Card, Col, Dropdown, Input, Row, Space, Typography } from 'antd';
import { DownloadOutlined, DownOutlined, SearchOutlined } from '@ant-design/icons';
import { DashboardLayout } from 'components/DashboardLayout';
import fileImg from 'assets/images/Architecture/file.png';
import moreFileImg from 'assets/images/Architecture/more-file.png';

const { Title } = Typography;

interface IProps {
  title: string;
}

export const Architecture: FC<IProps> = ({ title }) => {
  const [searchText, setSearchText] = useState('');
  const { t } = useTranslation();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const handleSortChange = (value: string) => {
    console.log('Сортировка:', value);
  };

  const handleDownloadPDF = () => {
    console.log('Скачать PDF');
  };

  const docData = [
    {
      key: '1',
      title: 'Документы архитектуры 1',
      status: 'Загружено',
      iconColor: '#4CAF50'
    },
    {
      key: '2',
      title: 'Документы архитектуры 2',
      status: 'Подробнее',
      iconColor: '#4CAF50'
    },
    {
      key: '3',
      title: 'Документы архитектуры 2',
      status: 'Подробнее',
      iconColor: '#4CAF50'
    }
  ];

  return (
    <DashboardLayout title={t(title)}>
      <Row justify='space-between' style={{ marginBottom: 16 }}>
        <Col>
          <Space>
            <Input
              placeholder={t('filterBar.search')}
              prefix={<SearchOutlined />}
              style={{ width: 240 }}
              value={searchText}
              onChange={handleSearch}
            />
            <Dropdown
              menu={{
                items: [
                  {
                    key: 'alphabet',
                    label: t('filterBar.filter.alphabet')
                  },
                  {
                    key: 'date',
                    label: t('filterBar.filter.date')
                  }
                ],
                onClick: (info) => {
                  handleSortChange(info.key);
                }
              }}
              trigger={['click']}
            >
              <Button>
                {t('filterBar.filter.alphabet')} <DownOutlined />
              </Button>
            </Dropdown>
          </Space>
        </Col>
        <Col>
          <Button icon={<DownloadOutlined />} onClick={handleDownloadPDF}>
            {t('applicationDetails.buttons.pdf')}
          </Button>
        </Col>
      </Row>

      <div style={{ marginTop: 24 }}>
        <Title level={4}>{t('architecture.titles.documentsToUpload')}</Title>
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          {docData.map((doc) => (
            <Col key={doc.key}>
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
                <Title level={5} style={{ marginBottom: 8 }}>
                  {doc.title}
                </Title>
                <Button
                  type={doc.status === 'Загружено' ? undefined : 'primary'}
                  disabled={doc.status === 'Загружено'}
                  style={{ width: '100%', borderRadius: 6 }}
                >
                  {doc.status}
                </Button>
              </Card>
            </Col>
          ))}
        </Row>

        <div style={{ marginTop: 48 }}>
          <Title level={4}>{t('architecture.titles.additionalDocuments')}</Title>
          <Row style={{ marginTop: 16 }}>
            <Col>
              <Card
                style={{
                  textAlign: 'center',
                  borderRadius: 8,
                  border: '1px solid #eee'
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
                <Button style={{ width: '100%', borderRadius: 6 }}>{t('architecture.buttons.createDocument')}</Button>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    </DashboardLayout>
  );
};
