import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Form, Input, InputNumber, Modal } from 'antd';

export interface FormulaFormData {
  title: string;
  koefficent: number;
}

interface FormulaFormProps {
  visible: boolean;
  loading?: boolean;
  onSubmit: (data: FormulaFormData) => Promise<void>;
  onCancel: () => void;
}

export const FormulaForm: FC<FormulaFormProps> = ({ visible, loading = false, onSubmit, onCancel }) => {
  const [form] = Form.useForm<FormulaFormData>();
  const { t } = useTranslation();

  const handleSubmit = async (): Promise<void> => {
    try {
      const values = await form.validateFields();
      await onSubmit(values);
      form.resetFields();
    } catch (error) {
      console.error('Form validation error:', error);
    }
  };

  const handleCancel = (): void => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={t('formulas.form.modals.addTitle')}
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={500}
      centered
      destroyOnHidden
      styles={{
        header: {
          borderBottom: 'none',
          paddingBottom: 0
        },
        body: {
          paddingTop: 0
        }
      }}
    >
      <Form form={form} layout='vertical' onFinish={handleSubmit} size='large' style={{ marginTop: 24 }}>
        <Form.Item
          name='title'
          label={t('formulas.form.labels.title')}
          rules={[
            { required: true, message: t('formulas.form.validation.titleRequired') },
            { min: 2, message: t('formulas.form.validation.titleMin') },
            { max: 100, message: t('formulas.form.validation.titleMax') }
          ]}
          style={{ marginBottom: 24 }}
        >
          <Input
            placeholder={t('formulas.form.placeholders.fill')}
            style={{
              height: 48,
              borderRadius: 12,
              backgroundColor: '#f5f5f7',
              border: 'none',
              fontSize: 16
            }}
          />
        </Form.Item>

        <Form.Item
          name='koefficent'
          label={t('formulas.form.labels.coefficient')}
          rules={[
            { required: true, message: t('formulas.form.validation.coefRequired') },
            { type: 'number', min: 0, message: t('formulas.form.validation.coefNonNegative') },
            { type: 'number', max: 999999, message: t('formulas.form.validation.coefTooLarge') }
          ]}
          style={{ marginBottom: 32 }}
        >
          <InputNumber
            placeholder={t('formulas.form.placeholders.fill')}
            step={0.1}
            precision={2}
            min={0}
            style={{
              width: '100%',
              height: 48,
              borderRadius: 12,
              backgroundColor: '#f5f5f7',
              border: 'none',
              fontSize: 16
            }}
          />
        </Form.Item>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <Button
            onClick={handleCancel}
            size='large'
            style={{
              height: 48,
              borderRadius: 12,
              backgroundColor: '#f5f5f7',
              border: 'none',
              color: '#8e8e93',
              fontWeight: 500,
              fontSize: 16,
              minWidth: 100
            }}
          >
            {t('common.back')}
          </Button>

          <Button
            type='primary'
            htmlType='submit'
            loading={loading}
            size='large'
            style={{
              height: 48,
              borderRadius: 12,
              backgroundColor: '#007aff',
              borderColor: '#007aff',
              fontWeight: 500,
              fontSize: 16,
              minWidth: 120
            }}
          >
            {t('formulas.add')}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};
