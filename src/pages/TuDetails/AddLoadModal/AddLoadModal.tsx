import { FC, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Button, Col, Form, Input, InputNumber, message, Modal, Row, Space, Switch } from 'antd';
import { IForkMinimalParams } from 'types/requests';

import { useForkMinimalMutation, useGetTyByIdQuery } from 'api/Ty.api';
import { t } from 'i18next';

interface IProps {
  visible: boolean;
  onClose: () => void;
  tyId: string;
}

interface IFormValues {
  // Optional extras
  fire_fighting_inner?: string;
  fire_fighting_outer?: string;

  fire_input_1?: string;
  street_pass_input_1?: string;
  free_pressure_required_input_1?: number;
  collector_diametr_fire_1?: string;

  fire_input_2?: string;
  street_pass_input_2?: string;
  free_pressure_required_input_2?: number;
  collector_diametr_fire_2?: string;

  connection_target?: string;

  // Water connection
  collector_diametr_water?: string;
  water_pipe?: string;
  street_pass_water?: string;
  provide_water?: string;

  // Sewer connection
  collector_diametr_sewer?: string;
  sewer_pipe?: string;
  street_pass_sewer?: string;
  provide_sewer?: string;

  // Flags
  is_water?: boolean;
  is_kanal?: boolean;
}

export const AddLoadModal: FC<IProps> = ({ visible, onClose, tyId }) => {
  const [form] = Form.useForm<IFormValues>();
  const [forkMinimal, { isLoading }] = useForkMinimalMutation();
  const navigate = useNavigate();
  const { data } = useGetTyByIdQuery({ tyId }, { skip: !tyId });

  const initialValues = useMemo(
    () => ({
      is_water: data?.is_water ?? false,
      is_kanal: data?.is_kanal ?? false,
      connection_target: data?.connection_target ?? '',
      street_pass_water: data?.street_pass_water ?? data?.street_pass ?? '',
      collector_diametr_water: data?.collector_diametr_water ?? data?.collector ?? '',
      water_pipe: data?.water_pipe ?? '',
      provide_water: data?.provide_water ?? '',
      street_pass_sewer: data?.street_pass_sewer ?? data?.street_pass ?? '',
      collector_diametr_sewer: data?.collector_diametr_sewer ?? data?.collector ?? '',
      sewer_pipe: data?.sewer_pipe ?? data?.sewer ?? '',
      provide_sewer: data?.provide_sewer ?? '',
      fire_input_1: data?.fire_input_1 ?? '',
      street_pass_input_1: data?.street_pass_input_1 ?? '',
      free_pressure_required_input_1:
        typeof data?.free_pressure_required_input_1 === 'number'
          ? (data?.free_pressure_required_input_1 as number)
          : Number((data?.free_pressure_required_input_1 as string) || 0),
      collector_diametr_fire_1: data?.collector_diametr_fire_1 ?? '',
      fire_input_2: data?.fire_input_2 ?? '',
      street_pass_input_2: data?.street_pass_input_2 ?? '',
      free_pressure_required_input_2:
        typeof data?.free_pressure_required_input_2 === 'number'
          ? (data?.free_pressure_required_input_2 as number)
          : Number((data?.free_pressure_required_input_2 as string) || 0),
      collector_diametr_fire_2: data?.collector_diametr_fire_2 ?? '',
      fire_fighting_inner: data?.fire_fighting_inner ?? '',
      fire_fighting_outer: data?.fire_fighting_outer ?? ''
    }),
    [data]
  );

  useEffect(() => {
    if (!visible || !data) return;
    form.setFieldsValue({
      is_water: data.is_water ?? false,
      is_kanal: data.is_kanal ?? false,
      connection_target: data.connection_target ?? '',
      street_pass_water: data.street_pass_water ?? data.street_pass ?? '',
      collector_diametr_water: data.collector_diametr_water ?? data.collector ?? '',
      water_pipe: data.water_pipe ?? '',
      provide_water: data.provide_water ?? '',
      street_pass_sewer: data.street_pass_sewer ?? data.street_pass ?? '',
      collector_diametr_sewer: data.collector_diametr_sewer ?? data.collector ?? '',
      sewer_pipe: data.sewer_pipe ?? data.sewer ?? '',
      provide_sewer: data.provide_sewer ?? '',
      fire_input_1: data.fire_input_1 ?? '',
      street_pass_input_1: data.street_pass_input_1 ?? '',
      free_pressure_required_input_1:
        typeof data.free_pressure_required_input_1 === 'number'
          ? data.free_pressure_required_input_1
          : Number(data.free_pressure_required_input_1 || 0),
      collector_diametr_fire_1: data.collector_diametr_fire_1 ?? '',
      fire_input_2: data.fire_input_2 ?? '',
      street_pass_input_2: data.street_pass_input_2 ?? '',
      free_pressure_required_input_2:
        typeof data.free_pressure_required_input_2 === 'number'
          ? data.free_pressure_required_input_2
          : Number(data.free_pressure_required_input_2 || 0),
      collector_diametr_fire_2: data.collector_diametr_fire_2 ?? '',
      fire_fighting_inner: data.fire_fighting_inner ?? '',
      fire_fighting_outer: data.fire_fighting_outer ?? ''
    });
  }, [visible, data, form]);

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  const handleSubmit = async (values: IFormValues) => {
    try {
      const payload: IForkMinimalParams = {
        id: tyId,

        // Optional extras (will be ignored by API if not supported)
        fire_fighting_inner: values.fire_fighting_inner,
        fire_fighting_outer: values.fire_fighting_outer,

        fire_input_1: values.fire_input_1,
        street_pass_input_1: values.street_pass_input_1,
        free_pressure_required_input_1: values.free_pressure_required_input_1,
        collector_diametr_fire_1: values.collector_diametr_fire_1,

        fire_input_2: values.fire_input_2,
        street_pass_input_2: values.street_pass_input_2,
        free_pressure_required_input_2: values.free_pressure_required_input_2,
        collector_diametr_fire_2: values.collector_diametr_fire_2,

        connection_target: values.connection_target,

        collector_diametr_water: values.collector_diametr_water,
        water_pipe: values.water_pipe,
        street_pass_water: values.street_pass_water,
        provide_water: values.provide_water,

        collector_diametr_sewer: values.collector_diametr_sewer,
        sewer_pipe: values.sewer_pipe,
        street_pass_sewer: values.street_pass_sewer,
        provide_sewer: values.provide_sewer,

        is_water: values.is_water,
        is_kanal: values.is_kanal
      };

      const result = await forkMinimal(payload).unwrap();
      if (result && result.id) {
        message.success(t('historyOfLoads.messages.addSuccess') || 'Нагрузка добавлена');
        navigate(`/dashboard/technical-conditions/history-of-loads/${tyId}`);
        handleCancel();
      } else {
        message.error(t('historyOfLoads.messages.addError') || 'Не удалось добавить нагрузку');
      }
    } catch (e) {
      console.error(e);
      message.error(t('historyOfLoads.messages.addError') || 'Не удалось добавить нагрузку');
    }
  };

  return (
    <Modal title={t('historyOfLoads.addLoad') || 'Добавить нагрузку'} open={visible} onCancel={handleCancel} width={640} footer={null}>
      <Form form={form} layout='vertical' onFinish={handleSubmit} style={{ marginTop: 16 }} initialValues={initialValues} key={tyId}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name='is_water' label={t('addTuForms.form.labels.isWater') || 'Подключение к воде'} valuePropName='checked'>
              <Switch />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name='is_kanal' label={t('addTuForms.form.labels.isKanal') || 'Подключение к канализации'} valuePropName='checked'>
              <Switch />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name='connection_target' label={t('addTuForms.form.labels.connectionTarget') || 'К чему подключается объект'}>
          <Input size='large' placeholder='' />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name='street_pass_water' label={t('addTuForms.form.labels.streetPass') || 'Проходящий по ул. (вода)'}>
              <Input size='large' />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name='collector_diametr_water' label={t('addTuForms.form.labels.collector') || 'Коллектор (вода)'}>
              <Input size='large' />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name='water_pipe' label={t('addTuForms.form.labels.waterPipe') || 'Водопровод'}>
              <Input size='large' />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name='provide_water' label={t('addTuForms.form.labels.provideWater') || 'Предусмотреть водопровод'}>
              <Input size='large' />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name='street_pass_sewer' label={t('addTuForms.form.labels.streetPass') || 'Проходящий по ул. (канал.)'}>
              <Input size='large' />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name='collector_diametr_sewer' label={t('addTuForms.form.labels.collector') || 'Коллектор (канал.)'}>
              <Input size='large' />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name='sewer_pipe' label={t('addTuForms.form.labels.sewer') || 'Канализация'}>
              <Input size='large' />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name='provide_sewer' label={t('addTuForms.form.labels.provideSewer') || 'Предусмотреть канализацию'}>
              <Input size='large' />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name='fire_input_1' label={t('addTuForms.form.labels.fireInput1') || 'Ввод 1'}>
              <Input size='large' />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name='free_pressure_required_input_1'
              label={t('addTuForms.form.labels.freePressureInput1') || 'Свободный напор ввод 1'}
            >
              <InputNumber style={{ width: '100%' }} size='large' min={0} step={0.01} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name='street_pass_input_1' label={t('addTuForms.form.labels.streetPass') || 'Проходящий по ул. (Пожар-1)'}>
              <Input size='large' />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name='collector_diametr_fire_1' label={t('addTuForms.form.labels.waterPipeDiameter1') || 'Коллектор (Пожар-1)'}>
              <Input size='large' />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name='fire_input_2' label={t('addTuForms.form.labels.fireInput2') || 'Ввод 2'}>
              <Input size='large' />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name='free_pressure_required_input_2'
              label={t('addTuForms.form.labels.freePressureInput2') || 'Свободный напор ввод 2'}
            >
              <InputNumber style={{ width: '100%' }} size='large' min={0} step={0.01} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name='street_pass_input_2' label={t('addTuForms.form.labels.streetPass') || 'Проходящий по ул. (Пожар-2)'}>
              <Input size='large' />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name='collector_diametr_fire_2' label={t('addTuForms.form.labels.waterPipeDiameter2') || 'Коллектор (Пожар-2)'}>
              <Input size='large' />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name='fire_fighting_inner' label={t('addTuForms.form.labels.fireFightingInner') || 'Пожаротушение (внутр.)'}>
              <Input size='large' />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name='fire_fighting_outer' label={t('addTuForms.form.labels.fireFightingOuter') || 'Пожаротушение (наружн.)'}>
              <Input size='large' />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item style={{ marginTop: 8 }}>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={handleCancel}>{t('paymentsModal.buttons.cancel') || 'Отмена'}</Button>
            <Button type='primary' htmlType='submit' loading={isLoading}>
              {t('common.save') || 'Сохранить'}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};
