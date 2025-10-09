import { FC, useCallback, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Button, Col, DatePicker, Form, Input, message, Row, Select, Typography } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import dayjs, { Dayjs } from 'dayjs';
import { MaskedInput } from 'common/ui';
import { DashboardLayout } from 'components';
import { ITyItem } from 'types/entities';
import './style.scss';

import { useGetAllFormulasQuery } from 'api/Formula.api';
import { useLazyGetAllObjectsQuery } from 'api/Object.api';
import { useGetTyByIdQuery, useGetTypesTyQuery, useUpdateTyMutation } from 'api/Ty.api';
import { t } from 'i18next';
import { handleEnterFocusNext } from 'utils/formNavigation';
import { eniSchema, zodRule } from 'utils/validation';

const { Option } = Select;
const { Title } = Typography;

type FormValues = Omit<ITyItem, 'type_ty' | 'customer' | 'application'> & {
  type_ty: number;
  customer: string;
  application: number;
};

const getTypeTyId = (tt: unknown): number | undefined => {
  if (typeof tt === 'number') return tt;
  if (tt && typeof tt === 'object' && 'id' in (tt as Record<string, unknown>)) {
    const id = (tt as { id?: number }).id;
    return typeof id === 'number' ? id : undefined;
  }
  return undefined;
};

const AddTuForms: FC<{ title: string }> = ({ title }) => {
  const navigate = useNavigate();
  const { tyId } = useParams();
  const formulasQuery = useGetAllFormulasQuery({ page: 1 });
  const typesTyQuery = useGetTypesTyQuery();
  const [updateTy, { isLoading, isSuccess }] = useUpdateTyMutation();
  const tuQuery = useGetTyByIdQuery({ tyId: tyId || '' });
  const [getObject] = useLazyGetAllObjectsQuery();
  const [form] = Form.useForm<FormValues>();

  const formatDate = useCallback((date: Dayjs | undefined) => date?.format('YYYY-MM-DD') || '', []);

  const parseDate = useCallback((dateString: string | undefined) => (dateString ? dayjs(dateString) : null), []);
  const onFinish = useCallback(
    async (values: FormValues) => {
      console.log(values);

      try {
        if (!tuQuery.data) {
          message.error(t('addTuForms.messages.loadTuError'));
          return;
        }

        const payload = {
          ...values,

          customer: tuQuery.data.customer.id,
          application: tuQuery.data.application!.id,
          entity: tuQuery.data.entity,

          // Даты (на форме нормализуются в YYYY-MM-DD)
          request_date: values.request_date,
          payment_deadline: values.payment_deadline,

          // Select возвращает id типа, поэтому отправляем число, а не объект
          type_ty: values.type_ty
        };
        console.log({ payload });

        updateTy({ id: tyId as string, body: payload });
      } catch (e) {
        console.error(e);
        message.error(t('addTuForms.messages.createTuError'));
      }
    },
    [tuQuery, tyId, updateTy]
  );

  useEffect(() => {
    if (isSuccess) {
      message.success(t('addTuForms.messages.createTuSuccess'));
      form.resetFields();
      navigate(`/dashboard/technical-conditions/tu-details/${tyId}`);
    }
  }, [form, isSuccess, navigate, tyId]);

  useEffect(() => {
    if (tuQuery.data) {
      form.setFieldsValue({
        ...tuQuery.data,
        customer: tuQuery.data.customer.full_name,
        application: tuQuery.data.application?.id,
        request_date: tuQuery.data.request_date,
        payment_deadline: tuQuery.data.payment_deadline,
        // Для Select поле ожидает id. Бэк может вернуть либо объект, либо число.
        type_ty: getTypeTyId(tuQuery.data.type_ty)
      });
    }
  }, [form, getObject, tuQuery]);

  const stageOptions = useMemo(
    () => [
      { value: 'draft', label: t('addTuForms.form.options.stages.draft') },
      { value: 'review', label: t('addTuForms.form.options.stages.review') },
      { value: 'approved', label: t('addTuForms.form.options.stages.approved') },
      { value: 'done', label: t('addTuForms.form.options.stages.done') }
    ],
    []
  );
  const statusOptions = [
    {
      value: 'active',
      label: t('addTuForms.form.options.status.active')
    },
    {
      value: 'inactive',
      label: t('addTuForms.form.options.status.inactive')
    },
    {
      value: 'archived',
      label: t('addTuForms.form.options.status.archived')
    }
  ];

  // All fields inside "ТЕХНИЧЕСКИЕ ПАРАМЕТРЫ" should be read-only while editing TU
  const techParamsReadOnly = Boolean(tuQuery.data?.id);

  const onCustomerEdit = useCallback(() => {
    navigate(`/dashboard/customers/${tuQuery.data?.customer.id}/edit`);
  }, [navigate, tuQuery.data?.customer.id]);

  const onAddressEdit = useCallback(() => {
    navigate(`/dashboard/objects/${tuQuery.data?.entity}`);
  }, [navigate, tuQuery.data?.entity]);

  return (
    <DashboardLayout title={title}>
      <Form
        scrollToFirstError={{ behavior: 'smooth', scrollMode: 'if-needed', block: 'center' }}
        form={form}
        requiredMark={false}
        name='add-tu-form'
        layout='vertical'
        onFinish={onFinish}
        onKeyDown={handleEnterFocusNext}
        className='add-tu-forms'
      >
        <Title level={4} style={{ borderBottom: '1px solid #D9D9D9', paddingBottom: '4px' }}>
          {t('addTuForms.titles.main')}
        </Title>

        <Form.Item
          label={t('addTuForms.form.labels.requestSource')}
          name='request_source'
          rules={[{ required: true, message: t('addTuForms.form.validation.specifySource') }]}
        >
          <Input size='large' placeholder={t('addTuForms.form.placeholders.requestSource')} />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label={t('addTuForms.form.labels.requestNumber')}
              name='request_number'
              rules={[{ required: true, message: t('addTuForms.form.validation.specifyRequestNumber') }]}
            >
              <Input size='large' placeholder={t('addTuForms.form.placeholders.requestNumber')} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={t('addTuForms.form.labels.requestDate')}
              name='request_date'
              rules={[{ required: true, message: t('addTuForms.form.validation.specifyRequestDate') }]}
              normalize={(value: Dayjs) => formatDate(value)}
              getValueProps={(value: string) => ({ value: parseDate(value) })}
            >
              <DatePicker format='YYYY-MM-DD' size='large' placeholder={t('addTuForms.form.placeholders.requestDate')} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label={t('addTuForms.form.labels.customer')}
              name='customer'
              rules={[{ required: true, message: t('addTuForms.form.validation.specifyCustomer') }]}
            >
              <Input
                disabled
                size='large'
                placeholder={t('addTuForms.form.placeholders.customer')}
                addonAfter={
                  <Button type='link' style={{ padding: 0, height: 'auto' }} onClick={onCustomerEdit}>
                    <span style={{ fontSize: 14 }}>{t('addTuForms.form.buttons.change')}</span>
                  </Button>
                }
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={t('addTuForms.form.labels.objectName')}
              name='object_name'
              rules={[{ required: true, message: t('addTuForms.form.validation.specifyObjectName') }]}
            >
              <Input size='large' placeholder={t('addTuForms.form.placeholders.objectName')} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label={t('addTuForms.form.labels.address')}
              name='address'
              rules={[{ required: true, message: t('addTuForms.form.validation.specifyAddress') }]}
            >
              <Input
                disabled
                size='large'
                placeholder={t('addTuForms.form.placeholders.address')}
                addonAfter={
                  <Button type='link' style={{ padding: 0, height: 'auto' }} onClick={onAddressEdit}>
                    <span style={{ fontSize: 14 }}>{t('addTuForms.form.buttons.change')}</span>
                  </Button>
                }
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={t('addTuForms.form.labels.techConditionType')}
              name='type_ty'
              rules={[{ required: true, message: t('addTuForms.form.validation.selectType') }]}
            >
              <Select size='large' placeholder={t('addTuForms.form.placeholders.techConditionType')}>
                {typesTyQuery.data?.map((type) => (
                  <Option key={type.id} value={type.id}>
                    {type.title}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label={t('addTuForms.form.labels.eni')} name='eni' rules={[{ required: false }, { validator: zodRule(eniSchema) }]}>
          <MaskedInput size='large' mask='000-000-000-000' placeholder={t('addTuForms.form.placeholders.eni')} inputMode='numeric' />
        </Form.Item>

        {/* =========================
            ТЕХНИЧЕСКИЕ ПАРАМЕТРЫ
        ========================= */}
        <Title level={4} style={{ borderBottom: '1px solid #D9D9D9', paddingBottom: '4px', marginTop: '24px' }}>
          {t('addTuForms.titles.techParams')}
        </Title>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label={t('addTuForms.form.labels.sewageAmount')}
              name='sewage_amount'
              rules={[{ required: true, message: t('addTuForms.form.validation.required') }]}
            >
              <Input disabled={techParamsReadOnly} size='large' placeholder={t('addTuForms.form.placeholders.sewageAmount')} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={t('addTuForms.form.labels.waterRequired')} name='water_required' rules={[{ required: false }]}>
              <Input disabled={techParamsReadOnly} size='large' placeholder={t('addTuForms.form.placeholders.waterRequired')} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label={t('addTuForms.form.labels.pressureRequired')} name='pressure_required' rules={[{ required: false }]}>
              <Input disabled={techParamsReadOnly} size='large' placeholder={t('addTuForms.form.placeholders.pressureRequired')} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={t('addTuForms.form.labels.fireFightingOuter')} name='fire_fighting_inner' rules={[{ required: false }]}>
              <Input disabled={techParamsReadOnly} size='large' placeholder={t('addTuForms.form.placeholders.fireFighting')} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label={t('addTuForms.form.labels.fireFightingInner')} name='fire_fighting_outer' rules={[{ required: false }]}>
          <Input disabled={techParamsReadOnly} size='large' placeholder={t('addTuForms.form.placeholders.fireFighting')} />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label={t('addTuForms.form.labels.stage')} name='stage' rules={[{ required: false }]}>
              <Select size='large' placeholder={t('addTuForms.form.placeholders.stage')}>
                {stageOptions.map((option) => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={t('addTuForms.form.labels.formula')} name='formula' rules={[{ required: false }]}>
              <Select size='large' placeholder={t('addTuForms.form.placeholders.formula')}>
                {formulasQuery.data?.results.map((formula) => (
                  <Option key={formula.id} value={formula.id}>
                    {formula.title}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label={t('addTuForms.form.labels.status')} name='status' rules={[{ required: true }]}>
              <Select size='large' placeholder={t('addTuForms.form.placeholders.status')}>
                {statusOptions.map((option) => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {/* =========================
            ПОДКЛЮЧЕНИЕ
        ========================= */}
        <Title level={4} style={{ borderBottom: '1px solid #D9D9D9', paddingBottom: '4px', marginTop: '24px' }}>
          {t('addTuForms.titles.connection')}
        </Title>

        {/* Водопровод */}
        <Title level={5} style={{ marginTop: '12px' }}>
          {t('tuDetails.titles.waterSupply')}
        </Title>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label={t('addTuForms.form.labels.streetPass')} name='street_pass_water' rules={[{ required: false }]}>
              <Input size='large' placeholder={t('addTuForms.form.placeholders.streetPass')} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={t('addTuForms.form.labels.waterPipe')} name='water_pipe' rules={[{ required: false }]}>
              <Select size='large' placeholder={t('addTuForms.form.placeholders.selectOption')}>
                <Option value='существующий'>{t('addTuForms.form.options.connectionType.existing')}</Option>
                <Option value='построенный'>{t('addTuForms.form.options.connectionType.built')}</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Form.Item label={t('addTuForms.form.labels.provideWater')} name='provide_water' rules={[{ required: false }]}>
          <TextArea size='large' placeholder={t('addTuForms.form.placeholders.provideWater')} />
        </Form.Item>

        {/* Канализация */}
        <Title level={5} style={{ marginTop: '12px' }}>
          {t('tuDetails.titles.sewer')}
        </Title>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label={t('addTuForms.form.labels.streetPass')} name='street_pass_sewer' rules={[{ required: false }]}>
              <Input size='large' placeholder={t('addTuForms.form.placeholders.streetPass')} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label={t('addTuForms.form.labels.collector')} name='collector_diametr_sewer' rules={[{ required: false }]}>
              <Input type='number' min={0} size='large' placeholder={t('addTuForms.form.placeholders.diameter')} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label={t('addTuForms.form.labels.sewer')} name='sewer_pipe' rules={[{ required: false }]}>
              <Select size='large' placeholder={t('addTuForms.form.placeholders.selectOption')}>
                <Option value='существующий'>{t('addTuForms.form.options.connectionType.existing')}</Option>
                <Option value='построенный'>{t('addTuForms.form.options.connectionType.built')}</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Form.Item label={t('addTuForms.form.labels.provideSewer')} name='provide_sewer' rules={[{ required: false }]}>
          <TextArea size='large' placeholder={t('addTuForms.form.placeholders.provideSewer')} />
        </Form.Item>

        {/* Пожаротушение */}
        <Title level={5} style={{ marginTop: '12px' }}>
          {t('addTuForms.form.labels.fireInput1')}
        </Title>
        <Form.Item label={t('addTuForms.form.labels.fireInput1')} name='fire_input_1' rules={[{ required: false }]}>
          <Input size='large' placeholder={t('addTuForms.form.placeholders.fireInput1')} />
        </Form.Item>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label={t('addTuForms.form.labels.streetPass')} name='street_pass_input_1' rules={[{ required: false }]}>
              <Input size='large' placeholder={t('addTuForms.form.placeholders.streetPass')} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label={t('addTuForms.form.labels.freePressureInput1')}
              name='free_pressure_required_input_1'
              rules={[{ required: false }]}
            >
              <Input type='number' min={0} size='large' placeholder={t('addTuForms.form.placeholders.freePressureInput1')} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label={t('addTuForms.form.labels.waterPipeDiameter1')} name='collector_diametr_fire_1' rules={[{ required: false }]}>
              <Input size='large' placeholder={t('addTuForms.form.placeholders.waterPipeDiameter1')} />
            </Form.Item>
          </Col>
        </Row>

        <Title level={5} style={{ marginTop: '12px' }}>
          {t('addTuForms.form.labels.fireInput2')}
        </Title>
        <Form.Item label={t('addTuForms.form.labels.fireInput2')} name='fire_input_2' rules={[{ required: false }]}>
          <Input size='large' placeholder={t('addTuForms.form.placeholders.fireInput2')} />
        </Form.Item>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label={t('addTuForms.form.labels.streetPass')} name='street_pass_input_2' rules={[{ required: false }]}>
              <Input size='large' placeholder={t('addTuForms.form.placeholders.streetPass')} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label={t('addTuForms.form.labels.freePressureInput2')}
              name='free_pressure_required_input_2'
              rules={[{ required: false }]}
            >
              <Input type='number' min={0} size='large' placeholder={t('addTuForms.form.placeholders.freePressureInput2')} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label={t('addTuForms.form.labels.waterPipeDiameter2')} name='collector_diametr_fire_2' rules={[{ required: false }]}>
              <Input size='large' placeholder={t('addTuForms.form.placeholders.waterPipeDiameter2')} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label={t('addTuForms.form.labels.notes')} name='notes' rules={[{ required: false }]}>
          <Input.TextArea placeholder={t('addTuForms.form.placeholders.notes')} rows={3} />
        </Form.Item>

        {/* =========================
            ФИНАНСЫ
        ========================= */}
        <Title level={4} style={{ borderBottom: '1px solid #D9D9D9', paddingBottom: '4px', marginTop: '24px' }}>
          {t('addTuForms.titles.finance')}
        </Title>

        <Form.Item
          label={t('addTuForms.form.labels.paymentDeadline')}
          name='payment_deadline'
          rules={[]}
          normalize={(value: Dayjs) => formatDate(value)}
          getValueProps={(value: string) => ({ value: parseDate(value) })}
        >
          <DatePicker size='large' placeholder={t('addTuForms.form.placeholders.paymentDeadline')} format='YYYY-MM-DD' />
        </Form.Item>

        <Row justify='end'>
          <Col>
            <Form.Item style={{ marginTop: '24px' }}>
              <Button loading={isLoading} type='primary' htmlType='submit' size='large'>
                {t('addTuForms.form.buttons.submit')}
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </DashboardLayout>
  );
};

export default AddTuForms;
