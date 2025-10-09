import { FC } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { message } from 'antd';
import { CustomerForm } from 'components';
import { CustomerFormData } from 'components/CustomerForm/CustomerForm';
import { DashboardLayout } from 'components/DashboardLayout';

import { useCreateCustomerMutation } from 'api/Customer.api';

type ErrorWithData = { data: Record<string, string | string[]> };

function isErrorWithData(e: unknown): e is ErrorWithData {
  return typeof e === 'object' && e !== null && 'data' in e && typeof (e as { data?: unknown }).data === 'object';
}

interface IProps {
  title: string;
}

export const AddCustomer: FC<IProps> = ({ title }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [createCustomer] = useCreateCustomerMutation();

  const onSave = async (value: CustomerFormData & { fio?: string; companyName?: string }) => {
    try {
      const isLegal = value.type === 'legal';
      await createCustomer({
        full_name: isLegal ? value.companyName : value.fio,
        category: isLegal ? '0' : '1',
        pasport: value.passportData,
        address: value.address,
        contact: value.contactData,
        status: value.status
      }).unwrap();
      message.success(t('customers.messages.created'));
      navigate('/dashboard/customers');
    } catch (err: unknown) {
      if (isErrorWithData(err)) {
        const messages = Object.entries(err.data)
          .map(([field, msg]) => `${field}: ${Array.isArray(msg) ? msg.join(', ') : msg}`)
          .join('; ');
        message.error(`${t('common.errorPrefix')}${messages}`);
      } else {
        message.error(t('customers.messages.createError'));
      }
      console.error('Ошибка при создании заказчика:', err);
    }
  };

  const onCancel = () => {
    navigate(-1);
  };

  return (
    <DashboardLayout title={title}>
      <CustomerForm onCancel={onCancel} onSave={onSave} />
    </DashboardLayout>
  );
};
