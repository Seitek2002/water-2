import { type ReactNode, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Avatar, Flex, Layout, Menu, type MenuProps, Skeleton, theme, Typography } from 'antd';
import { FileTextOutlined, LeftOutlined, TeamOutlined, UploadOutlined, UserOutlined } from '@ant-design/icons';
import { NotificationsBell } from 'components/NotificationsBell';
import arrow from 'assets/icons/arrow.svg';
import logo from 'assets/icons/logo.svg';
import ApplicationIcon from 'assets/icons/sidebar/applications.svg?react';
import BuildingIcon from 'assets/icons/sidebar/building.svg?react';
import ComputingIcon from 'assets/icons/sidebar/computing.svg?react';
import ExportIcon from 'assets/icons/sidebar/export.svg?react';
import GeoportalIcon from 'assets/icons/sidebar/geoportal.svg?react';
import TuIcon from 'assets/icons/sidebar/tu.svg?react';
import './styles.scss';

import clsx from 'clsx';
import { usePermissions, useUserInfo } from 'hooks/useAuth';
import i18next from 'i18next';

const { Header, Sider, Content } = Layout;
interface Props {
  children: ReactNode;
  title?: string;
}

export const DashboardLayout = ({ children, title }: Props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { t } = useTranslation();

  const {
    token: { colorBgContainer }
  } = theme.useToken();

  const { hasPermission } = usePermissions();
  const { data: userResponse, isLoading: isUserLoading } = useUserInfo();

  const user = userResponse?.user;

  const getFullName = (): string => {
    if (!user) return 'Пользователь';

    const { first_name, last_name, email } = user;

    if (first_name && last_name) {
      return `${first_name} ${last_name}`;
    }

    if (first_name) return first_name;
    if (last_name) return last_name;

    // Если имени нет, показываем часть email до @
    return email.split('@')[0] || 'Пользователь';
  };

  const getAvatarUrl = (): string | undefined => {
    if (!user?.avatar) return undefined;

    if (user.avatar.startsWith('/media/')) {
      const apiKey = import.meta.env.VITE_API_KEY || 'https://bsv.sino0on.ru/api/v1/';
      const baseUrl = apiKey.replace('/api/v1/', '');
      return `${baseUrl}${user.avatar}`;
    }
    return user.avatar.trim() || undefined;
  };

  const siderStyle: React.CSSProperties = {
    overflow: 'auto',
    height: '100vh',
    position: 'sticky',
    insetInlineStart: 0,
    top: 0,
    bottom: 0,
    scrollbarWidth: 'thin',
    scrollbarGutter: 'stable',
    background: '#001529'
  };
  const items: MenuProps['items'] = [
    {
      key: '/dashboard/geo',
      icon: <GeoportalIcon />,
      label: t('dashboard.pages.geoportal')
    },
    hasPermission('view_technicalcondition') && {
      key: '/dashboard/technical-conditions',
      icon: <TuIcon />,
      label: t('dashboard.pages.ty')
    },
    hasPermission('view_entity') && {
      key: '/dashboard/objects',
      icon: <BuildingIcon />,
      label: t('dashboard.pages.objects')
    },
    hasPermission('view_application') && {
      key: '/dashboard/applications',
      icon: <ApplicationIcon />,
      label: t('dashboard.pages.applications')
    },
    {
      key: '/dashboard/invoices',
      icon: <FileTextOutlined />,
      label: t('dashboard.pages.bills')
    },
    {
      key: '/dashboard/protocols',
      icon: <FileTextOutlined />,
      label: t('dashboard.pages.protocols')
    },
    hasPermission('view_customer') && {
      key: '/dashboard/customers',
      icon: <TeamOutlined />,
      label: t('dashboard.pages.customers')
    },
    hasPermission('view_report') && {
      key: '/dashboard/export-data',
      icon: <ExportIcon />,
      label: t('dashboard.pages.export')
    },
    hasPermission('view_formula') && {
      key: '/dashboard/formulas',
      icon: <ComputingIcon />,
      label: t('dashboard.pages.formulas')
    },
    hasPermission('view_technicalcondition') && {
      key: '/dashboard/archive',
      icon: <UploadOutlined />,
      label: t('dashboard.pages.archive')
    }
  ].filter(Boolean) as MenuProps['items'];

  return (
    <>
      <style>
        {`
          .dashboard-avatar .ant-avatar {
            display: contents !important;
          }
        `}
      </style>
      <Layout className='dashboard' style={{ minHeight: '100vh' }}>
        <Sider style={siderStyle} collapsible collapsed={collapsed} onCollapse={(collapsed) => setCollapsed(collapsed)} width={230}>
          <Flex vertical style={{ height: '100%' }}>
            <Flex
              className='dashboard__logo'
              wrap='nowrap'
              align='center'
              gap={8}
              style={{
                color: '#fff',
                textAlign: 'center',
                padding: 16,
                fontWeight: 600
              }}
            >
              <img src={logo} alt='Logo' />
              <Typography.Text className={clsx('dashboard__logo-text', { hidden: collapsed })}>{t('login.title')}</Typography.Text>
            </Flex>

            <Menu
              theme='dark'
              mode='inline'
              style={{ flex: 1 }}
              selectedKeys={[location.pathname]}
              items={items}
              onClick={({ key }) => navigate(key)}
            />

            <Flex
              onClick={() => navigate('/dashboard/profile')}
              align='center'
              gap={8}
              style={{
                backgroundColor: '#3787FF',
                borderRadius: 12,
                padding: 8,
                margin: 16,
                cursor: 'pointer',
                color: '#fff',
                overflow: 'hidden',
                transition: 'all 0.3s'
              }}
            >
              <div className='dashboard-avatar'>
                <Avatar
                  size={32}
                  src={getAvatarUrl()}
                  icon={<UserOutlined />}
                  style={{
                    border: '2px solid rgba(255, 255, 255, 0.2)'
                  }}
                />
              </div>

              {!collapsed && (
                <div style={{ flex: 1, minWidth: 0 }}>
                  {isUserLoading ? (
                    <div>
                      <Skeleton.Input active size='small' style={{ width: '80px', height: '14px', marginBottom: '4px' }} />
                      <Skeleton.Input active size='small' style={{ width: '60px', height: '12px' }} />
                    </div>
                  ) : (
                    <>
                      <Typography.Text
                        style={{
                          color: '#fff',
                          display: 'block',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                        title={getFullName()}
                      >
                        {getFullName()}
                      </Typography.Text>
                      <Typography.Text
                        style={{
                          color: '#d6e4ff',
                          fontSize: 12,
                          display: 'block'
                        }}
                      >
                        ID {user?.id || '---'}
                      </Typography.Text>
                    </>
                  )}
                </div>
              )}

              <img src={arrow} alt='arrow' style={{ opacity: 0.7 }} />
            </Flex>
          </Flex>
        </Sider>

        <Layout>
          <Header style={{ background: colorBgContainer, paddingLeft: 24 }}>
            <Flex justify='space-between' align='center' gap={16}>
              <Flex align='center' gap={8}>
                {window.location.pathname.split('/').length > 3 && <LeftOutlined onClick={() => navigate(-1)} />}
                <h2 style={{ margin: 0 }}>{title ? (title.includes('.') ? i18next.t(title) : title) : i18next.t('dashboard.panel')}</h2>
              </Flex>
              <div>
                <NotificationsBell />
              </div>
            </Flex>
          </Header>

          <Content style={{ margin: '24px 16px 0' }}>
            <div
              style={{
                padding: 24,
                background: colorBgContainer,
                minHeight: '80vh'
              }}
            >
              {children}
            </div>
          </Content>
        </Layout>
      </Layout>
    </>
  );
};
