import React, { FC, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Button, Card, Col, DatePicker, Form, Input, message, Row, Select, Space, Spin, Typography } from 'antd';
import { ArrowLeftOutlined, EditOutlined, SaveOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { MaskedInput } from 'common/ui';
import { DashboardLayout } from 'components/DashboardLayout';
import { ObjectUpdateBody } from 'types/entities/objects';

import { useGetObjectByIdQuery, useUpdateObjectMutation } from 'api/Object.api';
import { cadastralSchema, zodRule } from 'utils/validation';

const { Title, Text } = Typography;
const { Option } = Select;

interface ApiError {
  data?: Record<string, string | string[]>;
  message?: string;
}

interface ObjectEditProps {
  title: string;
}

export const ObjectEdit: FC<ObjectEditProps> = ({ title }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const objectId = Number(id);
  const { t } = useTranslation();

  const [isEditMode, setIsEditMode] = useState(false);
  const [form] = Form.useForm();

  const { data: object, isLoading, error } = useGetObjectByIdQuery(objectId);
  const [updateObject, { isLoading: isSaving }] = useUpdateObjectMutation();

  const handleBack = (): void => {
    navigate('/dashboard/objects');
  };

  const handleEditToggle = (): void => {
    if (isEditMode) {
      // Отмена редактирования - сброс формы
      if (object) {
        form.setFieldsValue({
          title: object.title,
          contract_date: object.contract_date ? dayjs(object.contract_date) : null,
          type: object.type,
          status: object.status,
          address_street: object.address_street,
          address_number: object.address_number,
          kadastr_number: object.kadastr_number,
          usage_type: object.usage_type,
          tu_status: object.tu_status,
          latitude: object.latitude,
          longitude: object.longitude
        });
      }
      setIsEditMode(false);
    } else {
      setIsEditMode(true);
    }
  };

  const handleSave = async (): Promise<void> => {
    try {
      const values = await form.validateFields();

      if (!object) return;

      const updateData: ObjectUpdateBody = {
        title: values.title,
        contract_date: values.contract_date ? dayjs(values.contract_date).format('YYYY-MM-DD') : null,
        type: values.type || object.type || '',
        status: values.status,
        address_street: values.address_street,
        address_number: values.address_number || '',
        kadastr_number: values.kadastr_number,
        usage_type: values.usage_type || object.usage_type || '',
        tu_status: values.tu_status || object.tu_status || '',
        latitude: values.latitude || object.latitude || 0,
        longitude: values.longitude || object.longitude || 0,
        customer: object.customer,
        creater: object.creater || 0
      };

      await updateObject({
        id: objectId,
        body: updateData
      }).unwrap();

      message.success(t('objectEdit.messages.updated'));
      setIsEditMode(false);
    } catch (error) {
      const apiError = error as ApiError;

      if (apiError?.data && typeof apiError.data === 'object') {
        const messages = Object.entries(apiError.data)
          .map(([field, msg]) => {
            const errorMsg = Array.isArray(msg) ? msg.join(', ') : msg;
            return `${field}: ${errorMsg}`;
          })
          .join('; ');
        message.error(`Ошибка: ${messages}`);
      } else if (apiError?.message) {
        message.error(`Ошибка: ${apiError.message}`);
      } else {
        message.error(t('objectEdit.messages.updateError'));
      }
      console.error('Update object error:', error);
    }
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  const getStatusColor = (status: string): string => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'активен':
        return '#52c41a';
      case 'inactive':
      case 'неактивен':
        return '#d9d9d9';
      case 'pending':
      case 'в ожидании':
        return '#1890ff';
      case 'rejected':
      case 'отклонен':
        return '#ff4d4f';
      default:
        return '#d9d9d9';
    }
  };

  const formatCoordinates = (): string => {
    if (!object?.latitude || !object?.longitude) return '-';
    return `${object.latitude}° N, ${object.longitude}° E`;
  };

  React.useEffect(() => {
    if (object) {
      form.setFieldsValue({
        title: object.title,
        contract_date: object.contract_date ? dayjs(object.contract_date) : null,
        type: object.type,
        status: object.status,
        address_street: object.address_street,
        address_number: object.address_number,
        kadastr_number: object.kadastr_number,
        usage_type: object.usage_type,
        tu_status: object.tu_status,
        latitude: object.latitude,
        longitude: object.longitude
      });
    }
  }, [object, form]);

  if (isLoading) {
    return (
      <DashboardLayout title={title}>
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <Spin size='large' />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !object) {
    return (
      <DashboardLayout title={title}>
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <Text type='danger'>{t('objectDetail.loadError')}</Text>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={`${title} ${object.title}`}>
      <Space direction='vertical' size={24} style={{ width: '100%' }}>
        {/* Заголовок с кнопками */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={handleBack}
            style={{
              borderRadius: 12,
              backgroundColor: '#f5f5f7',
              border: 'none',
              color: '#8e8e93'
            }}
          >
            {t('objectEdit.buttons.backToObjects')}
          </Button>

          <Space>
            {isEditMode ? (
              <>
                <Button
                  onClick={handleEditToggle}
                  style={{
                    borderRadius: 12,
                    backgroundColor: '#f5f5f7',
                    border: 'none',
                    color: '#8e8e93'
                  }}
                >
                  {t('objectEdit.buttons.cancel')}
                </Button>
                <Button
                  type='primary'
                  icon={<SaveOutlined />}
                  onClick={handleSave}
                  loading={isSaving}
                  style={{
                    borderRadius: 12,
                    backgroundColor: '#007aff',
                    borderColor: '#007aff'
                  }}
                >
                  {t('objectEdit.buttons.save')}
                </Button>
              </>
            ) : (
              <Button
                type='primary'
                icon={<EditOutlined />}
                onClick={handleEditToggle}
                style={{
                  borderRadius: 12,
                  backgroundColor: '#007aff',
                  borderColor: '#007aff'
                }}
              >
                {t('objectEdit.buttons.edit')}
              </Button>
            )}
          </Space>
        </div>

        {/* Карточка с данными */}
        <Card
          style={{
            borderRadius: 16,
            border: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
          bodyStyle={{ padding: 32 }}
        >
          <Form form={form} layout='vertical' disabled={!isEditMode}>
            <Space direction='vertical' size={24} style={{ width: '100%' }}>
              {/* Заголовок объекта */}
              <div>
                {isEditMode ? (
                  <Form.Item
                    name='title'
                    rules={[{ required: true, message: t('objectEdit.validation.enterTitle') }]}
                    style={{ marginBottom: 0 }}
                  >
                    <Input
                      style={{
                        fontSize: 24,
                        fontWeight: 600,
                        color: '#1d1d1f',
                        border: 'none',
                        backgroundColor: '#f5f5f7',
                        borderRadius: 12,
                        padding: '12px 16px'
                      }}
                    />
                  </Form.Item>
                ) : (
                  <Title
                    level={3}
                    style={{
                      margin: 0,
                      color: '#1d1d1f',
                      fontWeight: 600
                    }}
                  >
                    {object.title}
                  </Title>
                )}
              </div>

              {/* Основная информация */}
              <Row gutter={[32, 24]}>
                <Col xs={24} md={12}>
                  <Space direction='vertical' size={16} style={{ width: '100%' }}>
                    {/* Дата договора */}
                    <div>
                      <Text
                        style={{
                          fontSize: 14,
                          color: '#8e8e93',
                          fontWeight: 500,
                          marginBottom: 8,
                          display: 'block'
                        }}
                      >
                        {t('objectEdit.labels.contractDate')}
                      </Text>
                      {isEditMode ? (
                        <Form.Item name='contract_date' style={{ marginBottom: 0 }}>
                          <DatePicker
                            style={{
                              width: '100%',
                              borderRadius: 12,
                              backgroundColor: '#f5f5f7',
                              border: 'none'
                            }}
                            format='YYYY-MM-DD'
                            placeholder={t('objectEdit.placeholders.pickDate')}
                          />
                        </Form.Item>
                      ) : (
                        <Text
                          style={{
                            fontSize: 16,
                            color: '#1d1d1f',
                            fontWeight: 600
                          }}
                        >
                          {formatDate(object.contract_date)}
                        </Text>
                      )}
                    </div>

                    {/* Тип */}
                    <div>
                      <Text
                        style={{
                          fontSize: 14,
                          color: '#8e8e93',
                          fontWeight: 500,
                          marginBottom: 8,
                          display: 'block'
                        }}
                      >
                        {t('objectEdit.labels.type')}
                      </Text>
                      {isEditMode ? (
                        <Form.Item name='type' style={{ marginBottom: 0 }}>
                          <Input
                            style={{
                              borderRadius: 12,
                              backgroundColor: '#f5f5f7',
                              border: 'none',
                              padding: '12px 16px'
                            }}
                            placeholder={t('objectEdit.placeholders.objectType')}
                          />
                        </Form.Item>
                      ) : (
                        <Text
                          style={{
                            fontSize: 16,
                            color: '#1d1d1f',
                            fontWeight: 600
                          }}
                        >
                          {object.type || '-'}
                        </Text>
                      )}
                    </div>

                    {/* Статус */}
                    <div>
                      <Text
                        style={{
                          fontSize: 14,
                          color: '#8e8e93',
                          fontWeight: 500,
                          marginBottom: 8,
                          display: 'block'
                        }}
                      >
                        {t('objectEdit.labels.status')}
                      </Text>
                      {isEditMode ? (
                        <Form.Item
                          name='status'
                          rules={[{ required: true, message: t('objectEdit.validation.selectStatus') }]}
                          style={{ marginBottom: 0 }}
                        >
                          <Select
                            style={{
                              borderRadius: 12
                            }}
                            placeholder={t('objectEdit.placeholders.selectStatus')}
                          >
                            <Option value='active'>{t('objectEdit.statusOptions.active')}</Option>
                            <Option value='inactive'>{t('objectEdit.statusOptions.inactive')}</Option>
                            <Option value='pending'>{t('objectEdit.statusOptions.pending')}</Option>
                            <Option value='rejected'>{t('objectEdit.statusOptions.rejected')}</Option>
                          </Select>
                        </Form.Item>
                      ) : (
                        <div
                          style={{
                            display: 'inline-block',
                            backgroundColor: getStatusColor(object.status),
                            color: 'white',
                            padding: '4px 12px',
                            borderRadius: 12,
                            fontSize: 14,
                            fontWeight: 500
                          }}
                        >
                          {object.status || t('objectEdit.statusOptions.active')}
                        </div>
                      )}
                    </div>

                    {/* Адрес */}
                    <div>
                      <Text
                        style={{
                          fontSize: 14,
                          color: '#8e8e93',
                          fontWeight: 500,
                          marginBottom: 8,
                          display: 'block'
                        }}
                      >
                        {t('objectEdit.labels.address')}
                      </Text>
                      {isEditMode ? (
                        <Space.Compact style={{ width: '100%' }}>
                          <Form.Item name='address_street' style={{ marginBottom: 0, flex: 1 }}>
                            <Input
                              style={{
                                borderRadius: '12px 0 0 12px',
                                backgroundColor: '#f5f5f7',
                                border: 'none',
                                padding: '12px 16px'
                              }}
                              placeholder={t('objectEdit.placeholders.street')}
                            />
                          </Form.Item>
                          <Form.Item name='address_number' style={{ marginBottom: 0, width: '30%' }}>
                            <Input
                              style={{
                                borderRadius: '0 12px 12px 0',
                                backgroundColor: '#f5f5f7',
                                border: 'none',
                                padding: '12px 16px'
                              }}
                              placeholder={t('objectEdit.placeholders.house')}
                            />
                          </Form.Item>
                        </Space.Compact>
                      ) : (
                        <Text
                          style={{
                            fontSize: 16,
                            color: '#1d1d1f',
                            fontWeight: 600
                          }}
                        >
                          {object.full_address ||
                            `г. Бишкек, ${object.address_street}${object.address_number ? `, ${object.address_number}` : ''}`}
                        </Text>
                      )}
                    </div>
                  </Space>
                </Col>

                <Col xs={24} md={12}>
                  <Space direction='vertical' size={16} style={{ width: '100%' }}>
                    {/* Кадастровый номер */}
                    <div>
                      <Text
                        style={{
                          fontSize: 14,
                          color: '#8e8e93',
                          fontWeight: 500,
                          marginBottom: 8,
                          display: 'block'
                        }}
                      >
                        {t('objectEdit.labels.cadastralNumber')}
                      </Text>
                      {isEditMode ? (
                        <Form.Item
                          name='kadastr_number'
                          rules={[
                            { required: true, message: t('objectEdit.validation.enterCadastralNumber') },
                            { validator: zodRule(cadastralSchema) }
                          ]}
                          style={{ marginBottom: 0 }}
                        >
                          <MaskedInput
                            mask='00-000-000-000'
                            inputMode='numeric'
                            placeholder={t('objectEdit.placeholders.cadastralNumber')}
                          />
                        </Form.Item>
                      ) : (
                        <Text
                          style={{
                            fontSize: 16,
                            color: '#1d1d1f',
                            fontWeight: 600,
                            fontFamily: 'monospace'
                          }}
                        >
                          {object.kadastr_number || '-'}
                        </Text>
                      )}
                    </div>

                    {/* Вид использования */}
                    <div>
                      <Text
                        style={{
                          fontSize: 14,
                          color: '#8e8e93',
                          fontWeight: 500,
                          marginBottom: 8,
                          display: 'block'
                        }}
                      >
                        {t('objectEdit.labels.usageType')}
                      </Text>
                      {isEditMode ? (
                        <Form.Item name='usage_type' style={{ marginBottom: 0 }}>
                          <Input
                            style={{
                              borderRadius: 12,
                              backgroundColor: '#f5f5f7',
                              border: 'none',
                              padding: '12px 16px'
                            }}
                            placeholder={t('objectEdit.placeholders.usageType')}
                          />
                        </Form.Item>
                      ) : (
                        <Text
                          style={{
                            fontSize: 16,
                            color: '#1d1d1f',
                            fontWeight: 600
                          }}
                        >
                          {object.usage_type || '-'}
                        </Text>
                      )}
                    </div>

                    {/* Статус ТУ */}
                    <div>
                      <Text
                        style={{
                          fontSize: 14,
                          color: '#8e8e93',
                          fontWeight: 500,
                          marginBottom: 8,
                          display: 'block'
                        }}
                      >
                        {t('objectEdit.labels.tuStatus')}
                      </Text>
                      {isEditMode ? (
                        <Form.Item name='tu_status' style={{ marginBottom: 0 }}>
                          <Input
                            style={{
                              borderRadius: 12,
                              backgroundColor: '#f5f5f7',
                              border: 'none',
                              padding: '12px 16px'
                            }}
                            placeholder={t('objectEdit.placeholders.tuStatus')}
                          />
                        </Form.Item>
                      ) : (
                        <Text
                          style={{
                            fontSize: 16,
                            color: '#1d1d1f',
                            fontWeight: 600
                          }}
                        >
                          {object.tu_status || '-'}
                        </Text>
                      )}
                    </div>

                    {/* Координаты */}
                    <div>
                      <Text
                        style={{
                          fontSize: 14,
                          color: '#8e8e93',
                          fontWeight: 500,
                          marginBottom: 8,
                          display: 'block'
                        }}
                      >
                        {t('objectEdit.labels.coordinates')}
                      </Text>
                      {isEditMode ? (
                        <Space.Compact style={{ width: '100%' }}>
                          <Form.Item name='latitude' style={{ marginBottom: 0, flex: 1 }}>
                            <Input
                              type='number'
                              step='any'
                              min={0}
                              style={{
                                borderRadius: '12px 0 0 12px',
                                backgroundColor: '#f5f5f7',
                                border: 'none',
                                padding: '12px 16px',
                                fontFamily: 'monospace'
                              }}
                              placeholder={t('objectEdit.placeholders.latitude')}
                            />
                          </Form.Item>
                          <Form.Item name='longitude' style={{ marginBottom: 0, flex: 1 }}>
                            <Input
                              type='number'
                              step='any'
                              min={0}
                              style={{
                                borderRadius: '0 12px 12px 0',
                                backgroundColor: '#f5f5f7',
                                border: 'none',
                                padding: '12px 16px',
                                fontFamily: 'monospace'
                              }}
                              placeholder={t('objectEdit.placeholders.longitude')}
                            />
                          </Form.Item>
                        </Space.Compact>
                      ) : (
                        <Text
                          style={{
                            fontSize: 16,
                            color: '#1d1d1f',
                            fontWeight: 600,
                            fontFamily: 'monospace'
                          }}
                        >
                          {formatCoordinates()}
                        </Text>
                      )}
                    </div>
                  </Space>
                </Col>
              </Row>
            </Space>
          </Form>
        </Card>
      </Space>
    </DashboardLayout>
  );
};
