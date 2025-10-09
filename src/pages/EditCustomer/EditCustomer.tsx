import { FC, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Form, message } from 'antd';
import { CustomerForm, CustomerFormData } from 'components/CustomerForm/CustomerForm';
import { DashboardLayout } from 'components/DashboardLayout';

import { useGetCustomerByIdQuery, useUpdateCustomerMutation } from 'api/Customer.api';

interface IProps {
  title: string;
}

export const EditCustomer: FC<IProps> = ({ title }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { customerId } = useParams<{ customerId: string }>();
  const { data } = useGetCustomerByIdQuery(customerId || '');
  const [updateCustomer] = useUpdateCustomerMutation();
  const [form] = Form.useForm<CustomerFormData>();

  // Корректное формирование initialValues для формы
  const initialValues: (CustomerFormData & { fio?: string; companyName?: string }) | undefined = useMemo(
    () =>
      data
        ? {
            type: data.category === '0' ? 'legal' : 'individual',
            passportData: data.pasport || '',
            companyName: data.category === '0' ? data.full_name || '' : '',
            fio: data.category === '1' ? data.full_name || '' : '',
            contactData: data.contact || '',
            address: data.address || '',
            status: (data.status as 'active' | 'rejected') || 'active'
          }
        : undefined,
    [data]
  );

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [form, initialValues]);

  const onSave = async (value: CustomerFormData & { fio?: string; companyName?: string }) => {
    try {
      const isLegal = value.type === 'legal';
      await updateCustomer({
        id: Number(customerId),
        body: {
          full_name: isLegal ? value.companyName : value.fio,
          category: isLegal ? '0' : '1',
          pasport: value.passportData,
          address: value.address,
          contact: value.contactData,
          status: value.status
        }
      }).unwrap();
      message.success(t('customers.messages.updated'));
      navigate('/dashboard/customers');
    } catch (error: any) {
      if (error?.data && typeof error.data === 'object') {
        const messages = Object.entries(error.data)
          .map(([field, msg]) => `${field}: ${Array.isArray(msg) ? msg.join(', ') : msg}`)
          .join('; ');
        message.error(`${t('common.errorPrefix')}${messages}`);
      } else {
        message.error(t('customers.messages.updateError'));
      }
      console.error('Ошибка при обновлении заказчика:', error);
    }
  };

  const onCancel = () => {
    navigate(-1);
  };

  return (
    <DashboardLayout title={title}>
      <CustomerForm onCancel={onCancel} onSave={onSave} initialValues={initialValues} form={form} />
    </DashboardLayout>
  );
};
