import { FC } from 'react';
import { Button, Col, Flex, Form, type FormInstance, Input, Row, UploadFile } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

import { t } from 'i18next';

export interface ApplicationFormData {
  customer: string;
  object: string;
  address: string;
  contact: string;
  quantity: string;
  pressure: string;
  waterRequired: string;
  firefightingExpenses: string;
  latitude: number;
  longitude: number;
}

interface ApplicationFormProps {
  initialValues?: ApplicationFormData;
  onSave: (values: ApplicationFormData) => void;
  onCancel: () => void;
  form?: FormInstance<ApplicationFormData>;
  submitText?: string;
  attachedFiles?: UploadFile[];
  setAttachedFiles?: (files: UploadFile[]) => void;
  setIsModalVisible?: (v: boolean) => void;
  onCustomerEdit?: () => void;
  onObjectEdit?: () => void;
  onStreetEdit?: () => void;
}

export const ApplicationForm: FC<ApplicationFormProps> = ({
  initialValues,
  onSave,
  onCancel,
  form: externalForm,
  submitText,
  attachedFiles,
  setAttachedFiles,
  setIsModalVisible,
  onCustomerEdit,
  onObjectEdit,
  onStreetEdit
}) => {
  const [form] = Form.useForm<ApplicationFormData>();
  const usedForm = externalForm || form;

  const buttonText =
    attachedFiles && attachedFiles.length > 0
      ? t('applicationsCreate.buttons.attachedCount', { count: attachedFiles.length })
      : t('applicationsCreate.buttons.attach');

  return (
    <Form form={usedForm} layout='vertical' variant='filled' requiredMark={false} onFinish={onSave} initialValues={initialValues}>
      <Form.Item
        name='customer'
        label={t('applicationsCreate.form.labels.customer')}
        rules={[{ required: true, message: t('applicationsCreate.form.validation.required') }]}
      >
        <Input
          size='large'
          placeholder={t('applicationsCreate.form.placeholders.fullName')}
          disabled={!!onCustomerEdit}
          addonAfter={
            onCustomerEdit ? (
              <Button type='link' style={{ padding: 0, height: 'auto' }} onClick={onCustomerEdit}>
                <span style={{ fontSize: 14 }}>{t('addTuForms.form.buttons.change')}</span>
              </Button>
            ) : undefined
          }
        />
      </Form.Item>
      <Form.Item
        name='object'
        label={t('applicationsCreate.form.labels.object')}
        rules={[{ required: true, message: t('applicationsCreate.form.validation.required') }]}
      >
        <Input
          size='large'
          placeholder={t('applicationsCreate.form.placeholders.companyName')}
          disabled={!!onObjectEdit}
          addonAfter={
            onObjectEdit ? (
              <Button type='link' style={{ padding: 0, height: 'auto' }} onClick={onObjectEdit}>
                <span style={{ fontSize: 14 }}>{t('addTuForms.form.buttons.change')}</span>
              </Button>
            ) : undefined
          }
        />
      </Form.Item>
      <Form.Item
        name='address'
        label={t('applicationsCreate.form.labels.street')}
        rules={[{ required: true, message: t('applicationsCreate.form.validation.required') }]}
      >
        <Input
          size='large'
          placeholder={t('applicationsCreate.form.placeholders.address')}
          disabled={!!onStreetEdit}
          addonAfter={
            onStreetEdit ? (
              <Button type='link' style={{ padding: 0, height: 'auto' }} onClick={onStreetEdit}>
                <span style={{ fontSize: 14 }}>{t('addTuForms.form.buttons.change')}</span>
              </Button>
            ) : undefined
          }
        />
      </Form.Item>
      <Flex gap={16}>
        <Col span={12}>
          <Form.Item
            name='quantity'
            label={t('applicationsCreate.form.labels.waterAmountRequired')}
            rules={[{ required: true, message: t('applicationsCreate.form.validation.required') }, { max: 5 }]}
          >
            <Input size='large' placeholder={t('applicationsCreate.form.placeholders.enterValue')} type='number' min={0} maxLength={5} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name='pressure'
            label={t('applicationsCreate.form.labels.pressureRequired')}
            rules={[{ required: true, message: t('applicationsCreate.form.validation.required') }, { max: 5 }]}
          >
            <Input size='large' placeholder={t('applicationsCreate.form.placeholders.enterValue')} type='number' min={0} maxLength={5} />
          </Form.Item>
        </Col>
      </Flex>
      <Form.Item
        label={t('applicationsCreate.form.labels.waterPurpose')}
        name='waterRequired'
        rules={[{ required: true, message: t('applicationsCreate.form.validation.required') }]}
      >
        <Input size='large' placeholder={t('applicationsCreate.form.placeholders.waterPurpose')} />
      </Form.Item>
      <Form.Item
        label={t('applicationsCreate.form.labels.firefightingExpenses')}
        name='firefightingExpensesInner'
        rules={[{ required: true, message: t('applicationsCreate.form.validation.required') }]}
      >
        <Input size='large' placeholder={t('applicationsCreate.form.placeholders.enterValue')} />
      </Form.Item>
      <Form.Item
        label={t('applicationsCreate.form.labels.firefightingExpensesOuter')}
        name='firefightingExpensesOuter'
        rules={[{ required: true, message: t('applicationsCreate.form.validation.required') }]}
      >
        <Input size='large' placeholder={t('applicationsCreate.form.placeholders.enterValue')} />
      </Form.Item>
      <Flex gap={16}>
        <Col span={12}>
          <Form.Item name='latitude' label={t('applicationsCreate.form.labels.coordX')} rules={[]}>
            <Input
              variant='filled'
              size='large'
              placeholder={t('applicationsCreate.form.placeholders.xPlaceholder')}
              type='number'
              step='any'
              inputMode='decimal'
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name='longitude' label={t('applicationsCreate.form.labels.coordY')} rules={[]}>
            <Input
              variant='filled'
              size='large'
              placeholder={t('applicationsCreate.form.placeholders.yPlaceholder')}
              type='number'
              step='any'
              inputMode='decimal'
            />
          </Form.Item>
        </Col>
      </Flex>
      <Flex justify='space-between' align='center'>
        {setIsModalVisible && setAttachedFiles && attachedFiles && (
          <Button onClick={() => setIsModalVisible(true)} icon={<UploadOutlined />}>
            {buttonText}
          </Button>
        )}
        <Row>
          <Button onClick={onCancel}>{t('common.back')}</Button>
          <Button type='primary' htmlType='submit' style={{ marginLeft: '8px' }}>
            {submitText || t('applicationsCreate.buttons.submit')}
          </Button>
        </Row>
      </Flex>
    </Form>
  );
};
