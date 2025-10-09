import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, List, Progress, Space, Typography } from 'antd';
import { CheckCircleTwoTone, CloseCircleTwoTone, FileOutlined } from '@ant-design/icons';
import type { IFileFolderFolder } from 'types/entities';

const { Title, Text } = Typography;

type FolderItem = IFileFolderFolder['required'][number];

interface DocumentsProgressProps {
  percent: number;
  commonFolders: FolderItem[];
}

export const DocumentsProgress: FC<DocumentsProgressProps> = ({ percent, commonFolders }) => {
  const { t } = useTranslation();

  return (
    <Card style={{ marginBottom: 16 }}>
      <Title level={4}>{t('tuDetails.titles.otherDocuments')}</Title>
      <Progress percent={percent} status={percent < 100 ? 'exception' : 'success'} />

      <Text type='secondary'>{t('tuDetails.hint.uploadToFinishTu')}</Text>
      {commonFolders.length > 0 && (
        <List
          style={{ margin: '16px 0' }}
          bordered
          dataSource={commonFolders}
          renderItem={(item) => {
            return (
              <List.Item>
                <Space>
                  {item.filled ? (
                    <CheckCircleTwoTone twoToneColor='#6be275ff' style={{ marginRight: 8 }} />
                  ) : (
                    <CloseCircleTwoTone twoToneColor='#E63A3A' style={{ marginRight: 8 }} />
                  )}
                  <FileOutlined style={{ color: '#327BE8' }} />
                  {item.title}
                </Space>
              </List.Item>
            );
          }}
        />
      )}
    </Card>
  );
};
