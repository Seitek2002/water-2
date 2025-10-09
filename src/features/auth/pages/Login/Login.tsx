import { FC, useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import type { SerializedError } from '@reduxjs/toolkit';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { Button, Form, Input, Typography } from 'antd';
import logo from 'assets/icons/logo.svg';
import bg from 'assets/images/login-bg.png';
import './style.scss';

import { useLoginMutation } from 'api/Auth.api';

const Login: FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [isFormValid, setIsFormValid] = useState(false);
  const [login, { isLoading, isError, error }] = useLoginMutation();

  const onFinish = async (values: { email: string; password: string }) => {
    try {
      const response = await login(values).unwrap();
      if (response?.access) {
        localStorage.setItem('access_token', JSON.stringify(response.access));
      }
      if (response?.refresh) {
        localStorage.setItem('refresh_token', JSON.stringify(response.refresh));
      }
      navigate('/dashboard/technical-conditions');
    } catch (e) {
      console.error('t{"error"}', e);
    }
  };

  const onValuesChange = () => {
    form
      .validateFields()
      .then(() => {
        setIsFormValid(true);
      })
      .catch(() => {
        setIsFormValid(false);
      });
  };

  const isFetchBaseQueryError = (e: unknown): e is FetchBaseQueryError => typeof e === 'object' && e !== null && 'status' in e;

  const isSerializedError = (e: unknown): e is SerializedError => typeof e === 'object' && e !== null && 'message' in e && 'name' in e;

  const getErrorMessageKey = (err: unknown): string => {
    if (isFetchBaseQueryError(err)) {
      const { status } = err;
      if (status === 400 || status === 401) return 'login.errors.invalidCredentials';
      if (status === 403) return 'login.errors.forbidden';
      if (status === 'FETCH_ERROR') return 'login.errors.network';
      if (status === 'PARSING_ERROR') return 'login.errors.parse';
      if (typeof status === 'number' && status >= 500) return 'login.errors.server';
      return 'login.errors.unknown';
    }
    if (isSerializedError(err)) {
      return 'login.errors.unknown';
    }
    return 'login.errors.unknown';
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ width: '50%', padding: '80px' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src={logo} alt='' style={{ width: '38px', height: '38px' }} />
          <Typography.Title level={3} style={{ marginLeft: '8px' }}>
            {t('login.title')}
          </Typography.Title>
        </div>
        <Typography.Title level={3} style={{ marginTop: '107px' }}>
          {t('login.welcome')}
        </Typography.Title>
        <Typography.Text type='secondary'>{t('login.description')}</Typography.Text>
        <Form
          form={form}
          name='validateOnly'
          layout='vertical'
          style={{ marginTop: '24px' }}
          onFinish={onFinish}
          onValuesChange={onValuesChange}
          validateTrigger='onBlur'
        >
          <Form.Item
            name='email'
            label='email'
            rules={[
              { required: true, message: t('login.email') },
              { min: 5, message: t('login.emailPlaceholder') }
            ]}
          >
            <Input placeholder={t('login.email')} size='large' style={{ background: '#f0f1f2' }} />
          </Form.Item>
          <Form.Item
            name='password'
            label={t('login.password')}
            rules={[
              { required: true, message: t('login.passwordInput') },
              { min: 5, message: t('login.passwordPlaceholder') }
            ]}
          >
            <Input.Password placeholder={t('login.password')} size='large' style={{ background: '#f0f1f2' }} />
          </Form.Item>
          <Form.Item style={{ marginTop: '24px' }}>
            <Button type='primary' htmlType='submit' size='large' style={{ width: '100%' }} disabled={!isFormValid || isLoading}>
              {isLoading ? t('login.loading') : t('login.login')}
            </Button>
          </Form.Item>
          {isError && error && (
            <Typography.Text type='danger'>
              {t('login.authorizationError')} {t(getErrorMessageKey(error))}
            </Typography.Text>
          )}
        </Form>
      </div>
      <div style={{ width: '50%' }}>
        <img src={bg} alt='' draggable='false' style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    </div>
  );
};

export default Login;
