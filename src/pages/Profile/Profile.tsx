import { type FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { Alert, Avatar, Badge, Button, Card, Divider, Modal, Radio, Space, Spin, Typography } from 'antd';
import { BellOutlined, FlagOutlined, GlobalOutlined, IdcardOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import { DashboardLayout } from 'components';
import './style.scss';

import { authApi } from 'api/Auth.api';
import { useUserInfo } from 'hooks/useAuth';
import { clearAuthData, isAuthenticated } from 'utils/authUtils';

interface IProps {
  title: string;
}

// Компоненты флагов для замены эмодзи
const RussianFlag: FC = () => (
  <div
    style={{
      width: '20px',
      height: '15px',
      display: 'inline-block',
      background: 'linear-gradient(to bottom, white 33%, #0052cc 33%, #0052cc 66%, #cc0000 66%)',
      border: '1px solid #ddd',
      borderRadius: '2px'
    }}
  />
);

const KyrgyzFlag: FC = () => (
  <div
    style={{
      width: '20px',
      height: '15px',
      display: 'inline-block',
      background: '#cc0000',
      border: '1px solid #ddd',
      borderRadius: '2px',
      position: 'relative'
    }}
  >
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '8px',
        height: '8px',
        border: '1px solid #ffcc00',
        borderRadius: '50%',
        backgroundColor: 'transparent'
      }}
    />
  </div>
);

const AmericanFlag: FC = () => (
  <div
    style={{
      width: '20px',
      height: '15px',
      display: 'inline-block',
      background:
        'linear-gradient(to bottom, #cc0000 7%, white 7%, white 14%, #cc0000 14%, #cc0000 21%, white 21%, white 28%, #cc0000 28%)',
      border: '1px solid #ddd',
      borderRadius: '2px',
      position: 'relative'
    }}
  >
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '8px',
        height: '8px',
        backgroundColor: '#002868'
      }}
    />
  </div>
);

export const Profile: FC<IProps> = ({ title }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('language');

  const { data: userResponse, isLoading: isUserLoading, error: userError, refetch: refetchUser } = useUserInfo(true);

  const user = userResponse?.user;
  useEffect(() => {
    if (isAuthenticated()) {
      refetchUser();
    }
  }, [refetchUser]);

  const changeLanguage = (lng: string): void => {
    if (i18n.language === lng) return;
    localStorage.setItem('i18nextLng', lng);
    i18n.changeLanguage(lng).finally(() => {
      window.location.reload();
    });
  };

  const languageOptions = [
    {
      label: (
        <Space align='center'>
          <RussianFlag />
          <div>
            <div style={{ fontWeight: 500 }}>{t('profile.ru')}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>Russian</div>
          </div>
        </Space>
      ),
      value: 'ru'
    },
    {
      label: (
        <Space align='center'>
          <KyrgyzFlag />
          <div>
            <div style={{ fontWeight: 500 }}>{t('profile.kg')}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>Kyrgyz</div>
          </div>
        </Space>
      ),
      value: 'kg'
    },
    {
      label: (
        <Space align='center'>
          <AmericanFlag />
          <div>
            <div style={{ fontWeight: 500 }}>{t('profile.en')}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>English</div>
          </div>
        </Space>
      ),
      value: 'en'
    }
  ];

  const handleLogout = (): void => {
    clearAuthData();
    localStorage.removeItem('i18nextLng');
    dispatch(authApi.util.resetApiState());
    window.history.replaceState(null, '', '/');
    navigate('/', { replace: true });
  };

  const getFullName = (): string => {
    if (!user) return t('profile.user');

    const { first_name, last_name, email } = user;

    if (first_name && last_name) {
      return `${first_name} ${last_name}`;
    }

    if (first_name) return first_name;
    if (last_name) return last_name;

    return email.split('@')[0] || t('profile.user');
  };

  const getAvatarUrl = (): string | undefined => {
    if (!user?.avatar) return undefined;
    return user.avatar.trim() || undefined;
  };

  const currentLang = i18n.language;

  if (isUserLoading) {
    return (
      <DashboardLayout title={t(title)}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '300px'
          }}
        >
          <Spin size='large' />
        </div>
      </DashboardLayout>
    );
  }

  if (userError) {
    return (
      <DashboardLayout title={t(title)}>
        <Alert
          message={t('profile.error.title')}
          description={t('profile.error.description')}
          type='error'
          showIcon
          action={
            <Button size='small' onClick={() => refetchUser()}>
              {t('objectDetail.retry')}
            </Button>
          }
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={t(title)}>
      <div className='language-settings'>
        <aside className='language-settings__sidebar'>
          <ul>
            <div className={`language-settings__item ${activeTab === 'language' ? 'active' : ''}`} onClick={() => setActiveTab('language')}>
              <FlagOutlined style={{ fontSize: '20px' }} />
              <li>{t('profile.currentLang')}</li>
            </div>
            <div className={`language-settings__item ${activeTab === 'account' ? 'active' : ''}`} onClick={() => setActiveTab('account')}>
              <UserOutlined style={{ fontSize: '20px' }} />
              <li>{t('profile.account')}</li>
            </div>
            <div className='language-settings__item' onClick={() => navigate('/dashboard/notifications')}>
              <BellOutlined style={{ fontSize: '20px' }} />
              <li>{t('routers.notifications')}</li>
            </div>
          </ul>
        </aside>

        <section className='language-settings__content'>
          {activeTab === 'language' && (
            <Card
              title={
                <Space>
                  <GlobalOutlined style={{ color: '#1890ff' }} />
                  {t('profile.currentLang')}
                </Space>
              }
              style={{ borderRadius: '12px' }}
            >
              <div style={{ marginBottom: '24px' }}>
                <Typography.Title level={5} style={{ marginBottom: '8px' }}>
                  {t('profile.description')}
                </Typography.Title>
                <Typography.Text type='secondary'>{t('profile.selectLanguageHint')}</Typography.Text>
              </div>

              <Divider />

              <div style={{ marginTop: '24px' }}>
                <Typography.Title level={5} style={{ marginBottom: '16px' }}>
                  {t('profile.selectLanguageHint')}
                </Typography.Title>

                <Radio.Group value={currentLang} onChange={(e) => changeLanguage(e.target.value)} style={{ width: '100%' }}>
                  <Space direction='vertical' style={{ width: '100%' }} size='middle'>
                    {languageOptions.map((option) => (
                      <Radio
                        key={option.value}
                        value={option.value}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: currentLang === option.value ? '2px solid #1890ff' : '1px solid #f0f0f0',
                          borderRadius: '8px',
                          backgroundColor: currentLang === option.value ? '#f6ffed' : '#fafafa',
                          margin: 0,
                          display: 'flex',
                          alignItems: 'center',
                          transition: 'all 0.3s'
                        }}
                      >
                        {option.label}
                      </Radio>
                    ))}
                  </Space>
                </Radio.Group>
              </div>
            </Card>
          )}

          {activeTab === 'account' && (
            <Card
              title={
                <Space>
                  <UserOutlined style={{ color: '#1890ff' }} />
                  {t('profile.account')}
                </Space>
              }
              style={{ borderRadius: '12px' }}
            >
              <div style={{ marginBottom: '24px' }}>
                <Card
                  size='small'
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    color: 'white'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Badge dot={user?.is_confirm} color={user?.is_confirm ? '#52c41a' : '#fa8c16'} offset={[-8, 8]}>
                      <Avatar
                        size={72}
                        src={getAvatarUrl()}
                        icon={<UserOutlined />}
                        style={{ border: '3px solid rgba(255, 255, 255, 0.3)' }}
                      />
                    </Badge>

                    <div style={{ color: 'white' }}>
                      <Typography.Title level={3} style={{ margin: 0, color: 'white' }}>
                        {getFullName()}
                      </Typography.Title>
                    </div>
                  </div>
                </Card>
              </div>

              <Divider />

              <div style={{ marginTop: '24px' }}>
                <Typography.Title level={5} style={{ marginBottom: '16px' }}>
                  {t('profile.userInfo.title')}
                </Typography.Title>

                <Space direction='vertical' style={{ width: '100%' }} size='middle'>
                  <Card size='small' style={{ borderRadius: '8px' }}>
                    <Space>
                      <IdcardOutlined style={{ color: '#1890ff', fontSize: '16px' }} />
                      <Typography.Text strong>{t('profile.userInfo.id')}</Typography.Text>
                      <Typography.Text copyable>{user?.id}</Typography.Text>
                    </Space>
                  </Card>

                  <Card size='small' style={{ borderRadius: '8px' }}>
                    <Space>
                      <MailOutlined style={{ color: '#52c41a', fontSize: '16px' }} />
                      <Typography.Text strong>{t('profile.userInfo.email')}</Typography.Text>
                      <Typography.Text copyable>{user?.email}</Typography.Text>
                    </Space>
                  </Card>

                  {user?.phone && (
                    <Card size='small' style={{ borderRadius: '8px' }}>
                      <Space>
                        <span style={{ fontSize: '16px' }}>📞</span>
                        <Typography.Text strong>{t('profile.userInfo.phone')}</Typography.Text>
                        <Typography.Text copyable>{user.phone}</Typography.Text>
                      </Space>
                    </Card>
                  )}

                  {user?.auth_provider && (
                    <Card size='small' style={{ borderRadius: '8px' }}>
                      <Space>
                        <span style={{ fontSize: '16px' }}>🔐</span>
                        <Typography.Text strong>{t('profile.userInfo.provider')}</Typography.Text>
                        <Typography.Text>{user.auth_provider}</Typography.Text>
                      </Space>
                    </Card>
                  )}
                </Space>
              </div>

              <Divider />

              <div style={{ textAlign: 'center', marginTop: '24px' }}>
                <Button
                  type='primary'
                  danger
                  size='large'
                  onClick={() => setIsModalVisible(true)}
                  style={{
                    borderRadius: '8px',
                    height: '48px',
                    fontWeight: 500
                  }}
                >
                  {t('profile.logout')}
                </Button>
              </div>
            </Card>
          )}
        </section>
      </div>

      <Modal
        title={t('profile.confirmTitle')}
        open={isModalVisible}
        onOk={handleLogout}
        onCancel={() => setIsModalVisible(false)}
        okText={t('profile.yes')}
        cancelText={t('profile.no')}
        centered
      >
        <p>{t('profile.confirmLogout')}</p>
      </Modal>
    </DashboardLayout>
  );
};
