import { FC } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { message } from 'antd';
import { DashboardLayout } from 'components/DashboardLayout';
import { ObjectForm, ObjectFormData } from 'components/ObjectForm/ObjectForm';

import { useCreateObjectMutation } from 'api/Object.api';

interface AddObjectProps {
  title?: string;
}

interface ApiError {
  data?: Record<string, string | string[]>;
  message?: string;
}

export const AddObject: FC<AddObjectProps> = ({ title: titleProp }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [createObject, { isLoading }] = useCreateObjectMutation();
  const pageTitle = titleProp ?? t('objects.add');

  const handleSubmit = async (formData: ObjectFormData): Promise<void> => {
    try {
      // Подготавливаем данные для API
      const objectData = {
        title: formData.title,
        address_street: formData.address_street,
        address_number: formData.address_number || '',
        kadastr_number: formData.kadastr_number,
        status: formData.status
      };

      await createObject(objectData).unwrap();
      message.success(t('objects.messages.created'));
      navigate('/dashboard/objects');
    } catch (error) {
      // Обработка ошибок API с правильной типизацией
      const apiError = error as ApiError;

      if (apiError?.data && typeof apiError.data === 'object') {
        const messages = Object.entries(apiError.data)
          .map(([field, msg]) => {
            const errorMsg = Array.isArray(msg) ? msg.join(', ') : msg;
            return `${field}: ${errorMsg}`;
          })
          .join('; ');
        message.error(`${t('common.errorPrefix')}${messages}`);
      } else if (apiError?.message) {
        message.error(`${t('common.errorPrefix')}${apiError.message}`);
      } else {
        message.error(t('objects.messages.createError'));
      }
      console.error('Create object error:', error);
    }
  };

  const handleCancel = (): void => {
    navigate('/dashboard/objects');
  };

  return (
    <DashboardLayout title={pageTitle}>
      <ObjectForm onSubmit={handleSubmit} onCancel={handleCancel} loading={isLoading} />
    </DashboardLayout>
  );
};
