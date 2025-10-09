import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Card, Col, DatePicker, Form, Input, message, Row, Select, Space, Tag, Typography } from 'antd';
import { CloseOutlined, EditOutlined, SaveOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { MaskedInput } from 'common/ui';
import { EditableText } from 'components/EditableText';
import { ObjectItem, ObjectUpdateBody } from 'types/entities/objects';

import { useUpdateObjectMutation } from 'api/Object.api';
import { cadastralSchema, zodRule } from 'utils/validation';

const { Text, Title } = Typography;
const { Option } = Select;

interface ObjectDetailsProps {
  object: ObjectItem;
  onTitleChange?: (newTitle: string) => void;
}

interface ApiError {
  data?: Record<string, string | string[]>;
  message?: string;
}

export const ObjectDetails: FC<ObjectDetailsProps> = ({ object, onTitleChange }) => {
  const { t } = useTranslation();
  const [isEditMode, setIsEditMode] = useState(false);
  const [form] = Form.useForm();
  const [updateObject, { isLoading: isSaving }] = useUpdateObjectMutation();

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  const getFullAddress = (): string => {
    return object.full_address || `г. Бишкек, ${object.address_street}${object.address_number ? `, ${object.address_number}` : ''}`;
  };

  const getStatusColor = (status: string): string => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'активен':
        return 'success';
      case 'inactive':
      case 'неактивен':
        return 'default';
      case 'pending':
      case 'в ожидании':
        return 'processing';
      case 'rejected':
      case 'отклонен':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string): string => {
    const s = status?.toLowerCase();
    switch (s) {
      case 'active':
      case 'активен':
        return t('customers.status.active');
      case 'inactive':
      case 'не активен':
      case 'неактивен':
        return t('customers.status.inactive');
      case 'pending':
      case 'в ожидании':
        return t('applicationDetails.status.pending');
      case 'rejected':
      case 'отклонен':
      case 'отказано':
        return t('applicationDetails.status.rejected');
      default:
        return status || t('customers.status.active');
    }
  };

  const formatCoordinates = (): string => {
    if (!object.latitude || !object.longitude) return '-';
    return `${object.latitude}° N, ${object.longitude}° E`;
  };

  const handleEditToggle = (): void => {
    if (isEditMode) {
      if (object) {
        form.setFieldsValue({
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

      const updateData: ObjectUpdateBody = {
        title: object.title,
        contract_date: values.contract_date ? values.contract_date.format('YYYY-MM-DD') : object.contract_date || '',
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
        id: object.id,
        body: updateData
      }).unwrap();

      message.success(t('objects.messages.updated'));
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
        message.error(`${t('common.errorPrefix')}${messages}`);
      } else if (apiError?.message) {
        message.error(`${t('common.errorPrefix')}${apiError.message}`);
      } else {
        message.error(t('objects.messages.updateError'));
      }
      console.error('Update object error:', error);
    }
  };

  React.useEffect(() => {
    if (object) {
      form.setFieldsValue({
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

  return (
    <Card
      style={{
        borderRadius: 16,
        border: 'none',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}
    >
      <Space direction='vertical' size={24} style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <EditableText
              initialValue={object.title}
              onChange={onTitleChange}
              renderDisplay={(value) => (
                <Title
                  level={3}
                  style={{
                    margin: 0,
                    color: '#1d1d1f',
                    fontWeight: 600
                  }}
                >
                  {value}
                </Title>
              )}
            />
          </div>

          <div>
            {isEditMode ? (
              <Space>
                <Button
                  icon={<CloseOutlined />}
                  onClick={handleEditToggle}
                  style={{
                    borderRadius: 12,
                    backgroundColor: '#f5f5f7',
                    border: 'none',
                    color: '#8e8e93'
                  }}
                >
                  {t('common.cancel')}
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
                  {t('common.save')}
                </Button>
              </Space>
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
                {t('common.edit')}
              </Button>
            )}
          </div>
        </div>

        <Form form={form} layout='vertical' disabled={!isEditMode}>
          <Row gutter={[32, 24]}>
            <Col xs={24} md={12}>
              <Space direction='vertical' size={16} style={{ width: '100%' }}>
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
                    {t('customers.details.contract.contractDate')}
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
                        placeholder={t('paymentsModal.placeholders.date')}
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
                    {t('objectForm.labels.type')}
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
                        placeholder={t('objectForm.labels.type')}
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
                    {t('common.status')}
                  </Text>
                  {isEditMode ? (
                    <Form.Item
                      name='status'
                      rules={[{ required: true, message: t('objectForm.validation.statusRequired') }]}
                      style={{ marginBottom: 0 }}
                    >
                      <Select
                        style={{
                          borderRadius: 12
                        }}
                        placeholder={t('objectForm.placeholders.status')}
                      >
                        <Option value='active'>{t('customers.status.active')}</Option>
                        <Option value='inactive'>{t('customers.status.inactive')}</Option>
                        <Option value='pending'>{t('applicationDetails.status.pending')}</Option>
                        <Option value='rejected'>{t('applicationDetails.status.rejected')}</Option>
                      </Select>
                    </Form.Item>
                  ) : (
                    <div style={{ marginTop: 8 }}>
                      <Tag
                        color={getStatusColor(object.status)}
                        style={{
                          borderRadius: 12,
                          border: 'none',
                          fontSize: 14,
                          padding: '4px 12px',
                          fontWeight: 500
                        }}
                      >
                        {getStatusLabel(object.status)}
                      </Tag>
                    </div>
                  )}
                </div>

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
                    {t('applicationDetails.labels.address')}
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
                          placeholder={t('applicationsCreate.form.labels.street')}
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
                          placeholder={t('applicationsCreate.form.labels.house')}
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
                      {getFullAddress()}
                    </Text>
                  )}
                </div>
              </Space>
            </Col>

            <Col xs={24} md={12}>
              <Space direction='vertical' size={16} style={{ width: '100%' }}>
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
                    {t('objectForm.labels.cadastralNumber')}
                  </Text>
                  {isEditMode ? (
                    <Form.Item
                      name='kadastr_number'
                      rules={[
                        { required: true, message: t('objectForm.validation.cadastralRequired') },
                        { validator: zodRule(cadastralSchema) }
                      ]}
                      style={{ marginBottom: 0 }}
                    >
                      <MaskedInput mask='00-000-000-000' inputMode='numeric' placeholder={t('objectForm.placeholders.cadastralNumber')} />
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
                    {t('objectForm.labels.usageType')}
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
                        placeholder={t('objectForm.placeholders.usageType')}
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
                    {t('customers.details.contract.tuStatus')}
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
                        placeholder={t('customers.details.contract.tuStatus')}
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
                    {t('common.coordinates')}
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
                          placeholder={t('common.latitude')}
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
                          placeholder={t('common.longitude')}
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
        </Form>
      </Space>
    </Card>
  );
};
