import { FC, useEffect } from 'react';
import { Button, Col, Form, Input, InputNumber, message, Modal, Row, Space, Typography } from 'antd';
import type { IAccountingProtocol } from 'types/entities/accounting';

import { useUpdateProtocolMutation } from 'api/Accounting.api';

const { Title } = Typography;

interface IProps {
  visible: boolean;
  onClose: () => void;
  protocolData: IAccountingProtocol | null;
  onSuccess?: () => void;
}

interface IFormValues {
  load: string;
  water_price: string;
  kanal_price: string;
  coefficient: number;
  // Основные суммы
  water_sum: string;
  kanal_sum: string;
  total_water_sum: string;
  total_kanal_sum: string;
  // Бумажные работы
  paper_water_sum: string;
  paper_kanal_sum: string;
  // НСП для бумажных работ
  nsp_water_paper: string;
  nsp_kanal_paper: string;
  nsp_paper: string;
  // НДС для бумажных работ
  nds_kanal_paper: string;
  nds_water_paper: string;
  nds_paper: string;
  // Итоговые суммы
  total_sum_main: string;
  total_sum_paper: string;
  // Основные налоги
  nds: string;
  nsp: string;
  nsp_water: string;
  nsp_kanal: string;
}

export const EditProtocolModal: FC<IProps> = ({ visible, onClose, protocolData, onSuccess }) => {
  const [form] = Form.useForm<IFormValues>();
  const [updateProtocol, { isLoading }] = useUpdateProtocolMutation();

  useEffect(() => {
    if (visible && protocolData) {
      form.setFieldsValue({
        load: protocolData.load,
        water_price: protocolData.water_price,
        kanal_price: protocolData.kanal_price,
        coefficient: protocolData.coefficient,
        // Основные суммы
        water_sum: protocolData.water_sum,
        kanal_sum: protocolData.kanal_sum,
        total_water_sum: protocolData.total_water_sum,
        total_kanal_sum: protocolData.total_kanal_sum,
        // Бумажные работы
        paper_water_sum: protocolData.paper_water_sum,
        paper_kanal_sum: protocolData.paper_kanal_sum,
        // НСП для бумажных работ
        nsp_water_paper: protocolData.nsp_water_paper,
        nsp_kanal_paper: protocolData.nsp_kanal_paper,
        nsp_paper: protocolData.nsp_paper,
        // НДС для бумажных работ
        nds_kanal_paper: protocolData.nds_kanal_paper,
        nds_water_paper: protocolData.nds_water_paper,
        nds_paper: protocolData.nds_paper,
        // Итоговые суммы
        total_sum_main: protocolData.total_sum_main,
        total_sum_paper: protocolData.total_sum_paper,
        // Основные налоги
        nds: protocolData.nds,
        nsp: protocolData.nsp,
        nsp_water: protocolData.nsp_water,
        nsp_kanal: protocolData.nsp_kanal
      });
    }
  }, [visible, protocolData, form]);

  const handleSubmit = async (values: IFormValues) => {
    if (!protocolData) return;

    try {
      await updateProtocol({
        protocolId: protocolData.id.toString(),
        body: {
          ...values,
          technical_condition: protocolData.technical_condition
        }
      }).unwrap();

      // Вызываем callback для обработки успешного обновления в родительском компоненте
      if (onSuccess) {
        await onSuccess();
      }

      // Закрываем модалку только после успешной обработки
      onClose();
    } catch (error) {
      console.error('Update protocol error:', error);

      // Показываем детализированное сообщение об ошибке
      let errorMessage = 'Ошибка при обновлении протокола';

      if (error && typeof error === 'object' && 'status' in error) {
        const httpError = error as { status: number; data?: { message?: string } };

        if (httpError.status === 400) {
          errorMessage = 'Некорректные данные';
        } else if (httpError.status === 404) {
          errorMessage = 'Протокол не найден';
        } else if (httpError.status === 403) {
          errorMessage = 'Нет доступа для редактирования';
        } else if (httpError.status === 500) {
          errorMessage = 'Внутренняя ошибка сервера';
        } else if (httpError.data?.message) {
          errorMessage = httpError.data.message;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      message.error(errorMessage);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title='Редактирование протокола'
      open={visible}
      onCancel={handleCancel}
      width={800}
      footer={null}
      maskClosable={!isLoading}
      closable={!isLoading}
      style={{ top: 20 }}
    >
      <Form form={form} layout='vertical' onFinish={handleSubmit} style={{ marginTop: 16 }}>
        <Title level={5}>Основные параметры</Title>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name='load' label='Нагрузка' rules={[{ required: true, message: 'Обязательное поле' }]}>
              <Input placeholder='Введите нагрузку' disabled={isLoading} />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item name='coefficient' label='Коэффициент' rules={[{ required: true, message: 'Обязательное поле' }]}>
              <InputNumber style={{ width: '100%' }} placeholder='Введите коэффициент' step={0.01} min={0} disabled={isLoading} />
            </Form.Item>
          </Col>
        </Row>

        <Title level={5} style={{ marginTop: 16 }}>
          Цены
        </Title>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name='water_price' label='Цена за водопровод' rules={[{ required: true, message: 'Обязательное поле' }]}>
              <Input placeholder='Введите стоимость' disabled={isLoading} />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item name='kanal_price' label='Цена за канализацию' rules={[{ required: true, message: 'Обязательное поле' }]}>
              <Input placeholder='Введите стоимость' disabled={isLoading} />
            </Form.Item>
          </Col>
        </Row>

        <Title level={5} style={{ marginTop: 16 }}>
          Основные суммы
        </Title>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name='water_sum' label='Сумма водопровода' rules={[{ required: true, message: 'Обязательное поле' }]}>
              <Input placeholder='Введите сумму' disabled={isLoading} />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item name='kanal_sum' label='Сумма канализации' rules={[{ required: true, message: 'Обязательное поле' }]}>
              <Input placeholder='Введите сумму' disabled={isLoading} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name='total_water_sum' label='Итого водопровод' rules={[{ required: true, message: 'Обязательное поле' }]}>
              <Input placeholder='Введите итоговую сумму' disabled={isLoading} />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item name='total_kanal_sum' label='Итого канализация' rules={[{ required: true, message: 'Обязательное поле' }]}>
              <Input placeholder='Введите итоговую сумму' disabled={isLoading} />
            </Form.Item>
          </Col>
        </Row>

        <Title level={5} style={{ marginTop: 16 }}>
          Основные налоги
        </Title>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name='nds' label='НДС основной' rules={[{ required: true, message: 'Обязательное поле' }]}>
              <Input placeholder='Введите НДС' disabled={isLoading} />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item name='nsp' label='НСП основной' rules={[{ required: true, message: 'Обязательное поле' }]}>
              <Input placeholder='Введите НСП' disabled={isLoading} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name='nsp_water' label='НСП водопровод' rules={[{ required: true, message: 'Обязательное поле' }]}>
              <Input placeholder='Введите НСП' disabled={isLoading} />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item name='nsp_kanal' label='НСП канализация' rules={[{ required: true, message: 'Обязательное поле' }]}>
              <Input placeholder='Введите НСП' disabled={isLoading} />
            </Form.Item>
          </Col>
        </Row>

        <Title level={5} style={{ marginTop: 16 }}>
          Выдача технических условий
        </Title>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name='paper_water_sum' label='Водопровод' rules={[{ required: true, message: 'Обязательное поле' }]}>
              <Input placeholder='Введите сумму' disabled={isLoading} />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item name='paper_kanal_sum' label='Канализация' rules={[{ required: true, message: 'Обязательное поле' }]}>
              <Input placeholder='Введите сумму' disabled={isLoading} />
            </Form.Item>
          </Col>
        </Row>

        <Title level={5} style={{ marginTop: 16 }}>
          НСП для выдачи технических условий
        </Title>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name='nsp_water_paper' label='НСП водопровод' rules={[{ required: true, message: 'Обязательное поле' }]}>
              <Input placeholder='Введите НСП' disabled={isLoading} />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item name='nsp_kanal_paper' label='НСП канализация' rules={[{ required: true, message: 'Обязательное поле' }]}>
              <Input placeholder='Введите НСП' disabled={isLoading} />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item name='nsp_paper' label='НСП общий' rules={[{ required: true, message: 'Обязательное поле' }]}>
              <Input placeholder='Введите НСП' disabled={isLoading} />
            </Form.Item>
          </Col>
        </Row>

        <Title level={5} style={{ marginTop: 16 }}>
          НДС для выдачи технических условий
        </Title>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name='nds_water_paper' label='НДС водопровод' rules={[{ required: true, message: 'Обязательное поле' }]}>
              <Input placeholder='Введите НДС' disabled={isLoading} />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item name='nds_kanal_paper' label='НДС канализация' rules={[{ required: true, message: 'Обязательное поле' }]}>
              <Input placeholder='Введите НДС' disabled={isLoading} />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item name='nds_paper' label='НДС общий' rules={[{ required: true, message: 'Обязательное поле' }]}>
              <Input placeholder='Введите НДС' disabled={isLoading} />
            </Form.Item>
          </Col>
        </Row>

        <Title level={5} style={{ marginTop: 16 }}>
          Итоговые суммы
        </Title>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name='total_sum_main' label='Итого суммы' rules={[{ required: true, message: 'Обязательное поле' }]}>
              <Input placeholder='Введите итоговую сумму' disabled={isLoading} />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name='total_sum_paper'
              label='Итог за выдачу технических условий'
              rules={[{ required: true, message: 'Обязательное поле' }]}
            >
              <Input placeholder='Введите итоговую сумму' disabled={isLoading} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item style={{ marginTop: 24 }}>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={handleCancel} disabled={isLoading}>
              Отмена
            </Button>
            <Button type='primary' htmlType='submit' loading={isLoading}>
              Сохранить
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};
