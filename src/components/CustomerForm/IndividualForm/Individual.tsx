import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Flex, Form, Input } from 'antd';
import { MaskedInput } from 'common/ui';

import { phoneSchema, zodRule } from 'utils/validation';

const Individual: FC = () => {
  const { t } = useTranslation();
  return (
    <>
      <Form.Item
        name='fio'
        label={t('customerForm.labels.fio')}
        rules={[{ required: true, message: t('applicationsCreate.form.validation.required') }]}
      >
        <Input size='large' placeholder={t('customerForm.placeholders.fullName')} />
      </Form.Item>

      <Flex gap={16}>
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
      </Flex>
    </>
  );
};

export default Individual;
