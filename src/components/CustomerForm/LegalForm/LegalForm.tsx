import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, Input } from 'antd';
import { MaskedInput } from 'common/ui';

import { phoneSchema, zodRule } from 'utils/validation';

const LegalForm: FC = () => {
  const { t } = useTranslation();
  return (
    <>
      <Form.Item
        name='companyName'
        label={t('customerForm.labels.companyName')}
        rules={[{ required: true, message: t('applicationsCreate.form.validation.required') }]}
      >
        <Input size='large' placeholder={t('customerForm.placeholders.companyName')} />
      </Form.Item>

      <Form.Item name='ogrn' label={t('customerForm.labels.ogrn')} style={{ display: 'none' }} rules={[]}>
        <Input size='large' placeholder={t('customerForm.placeholders.ogrn')} />
      </Form.Item>

      <Form.Item
        name='passportData'
        label={t('customerForm.labels.passportData')}
        rules={[{ required: true, message: t('applicationsCreate.form.validation.required') }]}
      >
        <Input size='large' placeholder={t('customerForm.placeholders.passportData')} />
      </Form.Item>

      <Form.Item
        name='contactData'
        label={t('customerForm.labels.contactData')}
        rules={[{ required: true, message: t('applicationsCreate.form.validation.required') }, { validator: zodRule(phoneSchema) }]}
      >
        <MaskedInput size='large' mask='+996 000 000 000' inputMode='tel' placeholder={t('customerForm.placeholders.contactData')} />
      </Form.Item>
    </>
  );
};

export default LegalForm;
