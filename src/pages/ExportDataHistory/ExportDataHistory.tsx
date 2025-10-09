import { FC, useMemo } from 'react';
import { useLocation } from 'react-router';
import type { MenuProps } from 'antd';
import { Button, Dropdown, Flex, Input, message, Space, Typography } from 'antd';
import { DeleteOutlined, DownOutlined, RetweetOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { Table } from 'common/ui';
import { DashboardLayout } from 'components/DashboardLayout';

import type { ReportsResponse } from 'api/Reports.api';
import { usePermissions } from 'hooks/useAuth';
import { t } from 'i18next';

const menuItems: MenuProps['items'] = [
  { label: '1st menu item', key: '1', icon: <UserOutlined /> },
  { label: '2nd menu item', key: '2', icon: <UserOutlined /> }
];

const handleMenuClick: MenuProps['onClick'] = (e) => {
  message.info('Click on menu item.');
  console.log('click', e);
};

const menuProps = {
  items: menuItems,
  onClick: handleMenuClick
};

/* rows будут получены из state при навигации со страницы экспорта */

interface ExportDataHistoryProps {
  title: string;
}

const ExportDataHistory: FC<ExportDataHistoryProps> = ({ title }) => {
  const location = useLocation() as { state?: { reports?: ReportsResponse } };
  const { hasPermission } = usePermissions();

  const columns = useMemo(
    () => [
      {
        title: t('exportDataHistory.columns.date'),
        dataIndex: 'created_at',
        key: 'created_at',
        render: (text: string) => (text ? dayjs(text).format('DD.MM.YYYY HH:mm') : '-')
      },
      { title: t('exportDataHistory.columns.dataType'), dataIndex: 'report_type_display', key: 'report_type_display' },
      { title: t('folderDetail.columns.title'), dataIndex: 'title', key: 'title', render: (text: string) => text || '-' },
      {
        title: t('exportDataHistory.columns.format'),
        dataIndex: 'pdf_file',
        key: 'pdf_file',
        render: (url: string | undefined) =>
          url ? (
            <a href={url} target='_blank' rel='noopener noreferrer'>
              {t('paymentsTab.buttons.pdf')}
            </a>
          ) : (
            '-'
          )
      },
      {
        title: t('exportDataHistory.columns.actions'),
        key: 'actions',
        render: (_: unknown, record: { key: number }) => (
          <Space>
            {(hasPermission('change_report') || hasPermission('add_report')) && (
              <Button
                icon={<RetweetOutlined />}
                shape='circle'
                onClick={() => {
                  console.log('re-export', record);
                }}
              />
            )}
            {hasPermission('delete_report') && (
              <Button
                icon={<DeleteOutlined />}
                shape='circle'
                danger
                onClick={() => {
                  console.log('delete', record);
                }}
              />
            )}
          </Space>
        )
      }
    ],
    [hasPermission]
  );
  const rows =
    location.state?.reports?.results?.map((r) => ({
      key: r.id,
      ...r
    })) || [];

  if (!hasPermission('view_report')) {
    return (
      <DashboardLayout title={title}>
        <Typography.Text type='danger'>{t('exportDataHistory.noPermission')}</Typography.Text>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={title}>
      <Flex gap={12}>
        <Input addonBefore={<SearchOutlined />} placeholder={t('filterBar.search')} size='large' />
        <Dropdown menu={menuProps}>
          <Button size='large'>
            <Space>
              {t('exportDataHistory.byType')}
              <DownOutlined />
            </Space>
          </Button>
        </Dropdown>
        <Dropdown menu={menuProps}>
          <Button size='large'>
            <Space>
              {t('exportDataHistory.byStatus')}
              <DownOutlined />
            </Space>
          </Button>
        </Dropdown>
      </Flex>

      <div style={{ marginTop: 24 }}>
        <Table columns={columns} dataSource={rows} pagination={false} />
      </div>
    </DashboardLayout>
  );
};

export default ExportDataHistory;
