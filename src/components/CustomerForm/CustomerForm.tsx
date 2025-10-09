import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Form, FormInstance, Input, Radio, Select, Typography } from 'antd';
import IndividualForm from './IndividualForm/Individual';
import LegalForm from './LegalForm/LegalForm';
import './styles.scss';

const { Option } = Select;
const { Title } = Typography;

export interface CustomerFormData {
  type: 'individual' | 'legal';
  passportData: string;
  companyName?: string;
  contactData: string;
  address: string;
  status: 'active' | 'rejected';
}

interface CustomerFormProps {
  initialValues?: CustomerFormData;
  onSave: (values: CustomerFormData) => void;
  onCancel: () => void;
  form?: FormInstance<CustomerFormData>;
  submitText?: string;
}

export const CustomerForm: FC<CustomerFormProps> = ({ initialValues, onSave, onCancel, form: externalForm, submitText }) => {
  const [form] = Form.useForm<CustomerFormData>();
  const usedForm = externalForm || form;
  const { t } = useTranslation();

  const handleFinish = (values: CustomerFormData) => {
    onSave(values);
    form.resetFields();
  };

  return (
    <div className='customer-form'>
      <Title level={3}>{t('routers.addCustomer')}</Title>
      <Form
        form={usedForm}
        layout='vertical'
        name='customer_form'
        variant='filled'
        onFinish={handleFinish}
        initialValues={initialValues || { type: 'individual', status: 'active' }}
        requiredMark={false}
      >
        <Form.Item
          name='type'
          label={t('customerForm.labels.type')}
          rules={[{ required: true, message: t('customerForm.validation.pleaseSelectType') }]}
        >
          <Radio.Group size='large' block>
            <Radio.Button value='individual'>{t('customerForm.labels.individual')}</Radio.Button>
            <Radio.Button value='legal'>{t('customerForm.labels.legal')}</Radio.Button>
          </Radio.Group>
        </Form.Item>

        <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.type !== currentValues.type}>
          {({ getFieldValue }) => (getFieldValue('type') === 'individual' ? <IndividualForm /> : <LegalForm />)}
        </Form.Item>

        <Form.Item
          name='address'
          label={t('customerForm.labels.addressReg')}
          rules={[{ required: true, message: t('customerForm.validation.pleaseEnterAddress') }]}
        >
          <Input size='large' placeholder={t('customerForm.placeholders.address')} />
        </Form.Item>

        <Form.Item
          name='status'
          label={t('customerForm.labels.status')}
          rules={[{ required: true, message: t('customerForm.validation.pleaseSelectStatus') }]}
        >
          <Select size='large' placeholder={t('customerForm.placeholders.selectStatus')}>
            <Option value='active'>{t('customers.status.active')}</Option>
            <Option value='rejected'>{t('customers.status.inactive')}</Option>
          </Select>
        </Form.Item>

        <Form.Item>
          <Button size='large' type='primary' htmlType='submit' style={{ marginRight: 8 }}>
            {typeof submitText === 'string' ? submitText : t('common.save')}
          </Button>
          <Button size='large' onClick={onCancel}>
            {t('common.back')}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};
