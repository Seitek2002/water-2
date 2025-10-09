import { FC } from 'react';
import { useNavigate } from 'react-router';
import { Button, Result } from 'antd';
import { DashboardLayout } from 'components/DashboardLayout';

import { t } from 'i18next';

export const NotFound: FC = () => {
  const redirectTo = useNavigate();

  return (
    <DashboardLayout>
      <Result
        status='404'
        title='404'
        subTitle={t('notFound.subtitle')}
        extra={
          <Button onClick={() => redirectTo('/dashboard/geo')} type='primary'>
            {t('notFound.backHome')}
          </Button>
        }
      />
    </DashboardLayout>
  );
};
