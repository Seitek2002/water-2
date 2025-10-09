import { Button, Flex, Space, Typography } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { DeleteOutlined, DownloadOutlined, FileTextOutlined } from '@ant-design/icons';

import i18next from 'i18next';

const { Title, Link } = Typography;
const { t } = i18next;

type actionType = 'download' | 'delete';

export interface IDocument {
  key: string;
  name: string;
  document: string;
  uploadDate: string;
  innerDoc: string;
}

type IGetColumnsFn = (options: { onClick: (record: IDocument, action: actionType) => void }) => ColumnsType<IDocument>;

export const getColumns: IGetColumnsFn = ({ onClick }) => {
  const nameRender = (text: string, record: IDocument) => {
    return (
      <Flex gap={16}>
        <FileTextOutlined size={18} width={18} />
        <Flex vertical>
          <Title level={5}>{text}</Title>
          <Space split='>'>
            <Link underline>{record.document}</Link>
            <Link underline>{record.innerDoc}</Link>
          </Space>
        </Flex>
      </Flex>
    );
  };

  return [
    {
      key: 'name',
      title: t('folderDetail.columns.title'),
      dataIndex: 'name',
      render: nameRender
    },
    {
      key: 'date',
      title: t('folderDetail.columns.uploadedAt'),
      dataIndex: 'uploadDate',
      align: 'center'
    },
    {
      key: 'actions',
      title: t('folderDetail.columns.actions'),
      dataIndex: 'actions',
      align: 'center',
      render: (_, record) => (
        <Space>
          <Button icon={<DeleteOutlined />} danger onClick={() => onClick(record, 'delete')} />
          <Button icon={<DownloadOutlined />} onClick={() => onClick(record, 'download')} />
        </Space>
      )
    }
  ];
};

export const data: IDocument[] = [
  {
    key: '1',
    name: 'PDF_file.pdf',
    document: 'ТУ 44-957',
    innerDoc: 'Документ 1',
    uploadDate: '14-03-2025'
  },
  {
    key: '2',
    name: 'Договор',
    document: 'Договор',
    innerDoc: 'Документ 1',
    uploadDate: '14-03-2025'
  },
  {
    key: '3',
    name: 'Договор',
    document: 'Договор',
    innerDoc: 'Документ 1',
    uploadDate: '14-03-2025'
  }
];
