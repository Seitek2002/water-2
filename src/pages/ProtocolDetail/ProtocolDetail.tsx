import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Card, Col, List, Row, Space, Table, Tabs, Tag, Typography, Upload, UploadFile, UploadProps } from 'antd';
import { ClockCircleTwoTone, CloseCircleTwoTone, DownloadOutlined, EditOutlined, FileOutlined, UploadOutlined } from '@ant-design/icons';
import { DashboardLayout } from 'components/DashboardLayout';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface IProps {
  title: string;
}

interface IPaymentRecord {
  key: string;
  paymentNum: string;
  date: string;
  amount: string;
  source: string;
  status: string;
}

export const ProtocolDetail: FC<IProps> = ({ title }) => {
  const { t } = useTranslation();
  const [uploadFileList, setUploadFileList] = useState<UploadFile[]>([]);

  const handleUploadChange: UploadProps['onChange'] = (info) => {
    setUploadFileList(info.fileList);
  };

  const handleRemoveFile = (file: UploadFile) => {
    setUploadFileList((prev) => prev.filter((f) => f.uid !== file.uid));
  };

  const isProtocolDisabled = false;
  const isPaymentsDisabled = false;

  const [paymentData] = useState<IPaymentRecord[]>([
    {
      key: '1',
      paymentNum: '001',
      date: '03-03-2025',
      amount: '1500 KGZ',
      source: '1C',
      status: t('protocolDetail.payment.status.received')
    }
  ]);

  const paymentColumns = [
    {
      title: t('protocolDetail.payment.columns.paymentNum'),
      dataIndex: 'paymentNum',
      key: 'paymentNum'
    },
    {
      title: t('protocolDetail.payment.columns.date'),
      dataIndex: 'date',
      key: 'date'
    },
    {
      title: t('protocolDetail.payment.columns.amount'),
      dataIndex: 'amount',
      key: 'amount'
    },
    {
      title: t('protocolDetail.payment.columns.source'),
      dataIndex: 'source',
      key: 'source'
    },
    {
      title: t('protocolDetail.payment.columns.status'),
      dataIndex: 'status',
      key: 'status',
      render: (text: string) =>
        text === t('protocolDetail.payment.status.received') ? <Tag color='green'>{t('protocolDetail.payment.status.received')}</Tag> : text
    }
  ];

  return (
    <DashboardLayout title={title}>
      <Row gutter={24}>
        <Col span={16}>
          <Tabs defaultActiveKey='1'>
            <TabPane tab={t('protocolDetail.tabs.protocol')} key='1' disabled={isProtocolDisabled}>
              <Row justify='end' style={{ marginBottom: 16 }}>
                <Col>
                  <Space>
                    <Button type='primary' icon={<EditOutlined />}>
                      {t('applicationDetails.buttons.edit')}
                    </Button>
                    <Button icon={<DownloadOutlined />}>{t('protocolDetail.buttons.downloadProtocol')}</Button>
                  </Space>
                </Col>
              </Row>
              <Card style={{ marginBottom: 24 }}>
                <Row>
                  <Col span={12}>
                    <Title level={4} style={{ marginBottom: 16 }}>
                      {t('protocolDoc.companyName')}
                    </Title>
                  </Col>
                  <Col span={12} style={{ textAlign: 'right' }}>
                    <Button size='small' danger>
                      {t('protocolDoc.takeaway')}
                    </Button>
                  </Col>
                </Row>

                <div style={{ marginBottom: 8 }}>
                  <Row>
                    <Col span={12}>
                      <Text>{t('protocolDoc.vikCostLabel')}</Text>
                    </Col>
                    <Col span={12} style={{ textAlign: 'right' }}>
                      <Space>
                        <Text>10080KGZ</Text>
                      </Space>
                    </Col>
                  </Row>
                </div>

                <div style={{ marginBottom: 8 }}>
                  <Row>
                    <Col span={12}>
                      <Text>{t('protocolDoc.tuWater')}</Text>
                    </Col>
                    <Col span={12} style={{ textAlign: 'right' }}>
                      <Text>496KGZ</Text>
                    </Col>
                  </Row>
                </div>

                <div style={{ marginBottom: 8 }}>
                  <Row>
                    <Col span={12}>
                      <Text>{t('protocolDoc.tuSewer')}</Text>
                    </Col>
                    <Col span={12} style={{ textAlign: 'right' }}>
                      <Text>496KGZ</Text>
                    </Col>
                  </Row>
                </div>

                <div style={{ marginTop: 16 }}>
                  <Row>
                    <Col span={12}>
                      <Title level={4} style={{ margin: 0 }}>
                        {t('protocolDoc.totalWithoutVat')}
                      </Title>
                    </Col>
                    <Col span={12} style={{ textAlign: 'right' }}>
                      <Title level={5} style={{ margin: 0 }}>
                        992KGZ
                      </Title>
                    </Col>
                  </Row>
                </div>
              </Card>

              <div>{t('protocolDoc.extraText')}</div>
            </TabPane>

            <TabPane tab={t('protocolDetail.tabs.payments')} key='2' disabled={isPaymentsDisabled}>
              <Table columns={paymentColumns} dataSource={paymentData} pagination={false} />

              <Row justify='space-between' style={{ marginTop: 24 }}>
                <Col>
                  <Text>
                    {t('protocolDetail.paid')} <b>11000 KGZ</b> / <b>11000 KGZ</b>
                  </Text>
                </Col>
                <Col>
                  <Button danger>{t('protocolDetail.buttons.closeInvoice')}</Button>
                </Col>
              </Row>
            </TabPane>
          </Tabs>
        </Col>

        <Col span={8}>
          <Card style={{ marginBottom: 16 }}>
            <Title level={4}>{t('protocolDetail.invoice.title')}</Title>
            <Row justify={'space-between'}>
              <Text>{t('common.pending')}</Text>
              <ClockCircleTwoTone twoToneColor='#327BE8' />
            </Row>
            <Button style={{ marginTop: 16 }} block>
              {t('protocolDetail.buttons.generateInvoice')}
            </Button>
          </Card>

          <Card style={{ marginBottom: 16 }}>
            <Title level={4}>{t('protocolDetail.invoice.uploadReceipt')}</Title>
            <div
              style={{
                backgroundColor: '#327BE8',
                height: 8,
                borderRadius: 4,
                margin: '16px 0'
              }}
            />
            <Text type='secondary'>{t('tuDetails.hint.uploadToFinishTu')}</Text>
            {uploadFileList.length > 0 && (
              <List
                style={{ margin: '16px 0' }}
                bordered
                dataSource={uploadFileList}
                renderItem={(item) => (
                  <List.Item>
                    <Space>
                      <CloseCircleTwoTone
                        twoToneColor='#E63A3A'
                        style={{ marginRight: 8, cursor: 'pointer' }}
                        onClick={() => handleRemoveFile(item)}
                      />
                      <FileOutlined style={{ color: '#327BE8' }} />
                      {item.name}
                    </Space>
                  </List.Item>
                )}
              />
            )}

            <div style={{ marginTop: 16, width: '100%', textAlign: 'center' }}>
              <Upload multiple showUploadList={false} fileList={uploadFileList} beforeUpload={() => false} onChange={handleUploadChange}>
                <Button type='primary' block icon={<UploadOutlined />}>
                  {t('common.upload')}
                </Button>
              </Upload>
            </div>
          </Card>
        </Col>
      </Row>
    </DashboardLayout>
  );
};
