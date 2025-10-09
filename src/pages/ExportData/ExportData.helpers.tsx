import { FC, useMemo, useState } from 'react';
import { Checkbox, Col, DatePicker, Form, Input, InputNumber, Row, Select } from 'antd';
import type { FieldConfig } from './ExportData.config';

import { useGetAllCustomersQuery } from 'api/Customer.api';
import { useGetAllFormulasQuery } from 'api/Formula.api';
import { useGetAllObjectsQuery } from 'api/Object.api';
import { useGetTypesTyQuery } from 'api/Ty.api';
import { t } from 'i18next';

export const FiltersGrid: FC<{ fields: FieldConfig[] }> = ({ fields }) => {
  // Local state for live search inputs
  const [customerSearch, setCustomerSearch] = useState('');
  const [objectSearch, setObjectSearch] = useState('');

  // Load dynamic options
  const formulasQuery = useGetAllFormulasQuery({ page: 1 });
  const typesTyQuery = useGetTypesTyQuery();
  const customersQuery = useGetAllCustomersQuery({ page: 1, search: customerSearch || undefined });
  const objectsQuery = useGetAllObjectsQuery({ page: 1, page_size: 20, search: objectSearch || undefined });

  // Map to Select options
  const formulaOptions = useMemo(
    () => formulasQuery.data?.results?.map((f) => ({ value: f.id, label: f.title })) ?? [],
    [formulasQuery.data]
  );
  const typeTyOptions = useMemo(() => typesTyQuery.data?.map((t) => ({ value: t.id, label: t.title })) ?? [], [typesTyQuery.data]);
  const customerOptions = useMemo(
    () => customersQuery.data?.results?.map((c) => ({ value: c.id, label: c.full_name })) ?? [],
    [customersQuery.data]
  );
  const objectOptions = useMemo(() => objectsQuery.data?.results?.map((o) => ({ value: o.id, label: o.title })) ?? [], [objectsQuery.data]);

  const renderField = (fc: FieldConfig, idx: number) => {
    const name = ['filters', fc.name];
    const commonProps = { name, label: t(`exportData.filters.${fc.name}`) || fc.label } as const;

    // Dynamic overrides by field name
    if (fc.name === 'formula_id') {
      return (
        <Col span={12} key={`${fc.name}_${idx}`}>
          <Form.Item {...commonProps}>
            <Select
              allowClear
              showSearch
              options={formulaOptions}
              placeholder={t('exportData.placeholders.selectFormula') || 'Выберите формулу'}
              optionFilterProp='label'
              loading={formulasQuery.isLoading}
            />
          </Form.Item>
        </Col>
      );
    }

    if (fc.name === 'type_ty') {
      return (
        <Col span={12} key={`${fc.name}_${idx}`}>
          <Form.Item {...commonProps}>
            <Select
              allowClear
              showSearch
              options={typeTyOptions}
              placeholder={t('exportData.placeholders.selectTypeTU') || 'Выберите тип ТУ'}
              optionFilterProp='label'
              loading={typesTyQuery.isLoading}
            />
          </Form.Item>
        </Col>
      );
    }

    if (fc.name === 'customer_id') {
      return (
        <Col span={12} key={`${fc.name}_${idx}`}>
          <Form.Item {...commonProps}>
            <Select
              allowClear
              showSearch
              filterOption={false}
              onSearch={setCustomerSearch}
              options={customerOptions}
              placeholder={t('exportData.placeholders.searchCustomer') || 'Поиск заказчика (ФИО/Название)'}
              loading={customersQuery.isLoading}
            />
          </Form.Item>
        </Col>
      );
    }

    if (fc.name === 'entity_id') {
      return (
        <Col span={12} key={`${fc.name}_${idx}`}>
          <Form.Item {...commonProps}>
            <Select
              allowClear
              showSearch
              filterOption={false}
              onSearch={setObjectSearch}
              options={objectOptions}
              placeholder={t('exportData.placeholders.searchObject') || 'Поиск объекта (по названию)'}
              loading={objectsQuery.isLoading}
            />
          </Form.Item>
        </Col>
      );
    }

    // Default rendering by type
    switch (fc.type) {
      case 'number':
        return (
          <Col span={12} key={`${fc.name}_${idx}`}>
            <Form.Item {...commonProps}>
              <InputNumber min={0} style={{ width: '100%' }} placeholder={t('exportData.placeholders.numberExample') || '123'} />
            </Form.Item>
          </Col>
        );
      case 'string':
        return (
          <Col span={12} key={`${fc.name}_${idx}`}>
            <Form.Item {...commonProps}>
              <Input placeholder={t('exportData.placeholders.text') || 'Текст'} />
            </Form.Item>
          </Col>
        );
      case 'date':
        return (
          <Col span={12} key={`${fc.name}_${idx}`}>
            <Form.Item {...commonProps}>
              <DatePicker style={{ width: '100%' }} placeholder={t('exportData.placeholders.date') || 'YYYY-MM-DD'} />
            </Form.Item>
          </Col>
        );
      case 'boolean':
        return (
          <Col span={12} key={`${fc.name}_${idx}`}>
            <Form.Item {...commonProps} valuePropName='checked'>
              <Checkbox />
            </Form.Item>
          </Col>
        );
      case 'select':
        return (
          <Col span={12} key={`${fc.name}_${idx}`}>
            <Form.Item {...commonProps}>
              <Select
                allowClear
                optionFilterProp='label'
                options={fc.options?.map((o) => ({
                  ...o,
                  label: t(`exportData.select.${fc.name}.${o.value}`) || o.label
                }))}
              />
            </Form.Item>
          </Col>
        );
      default:
        return null;
    }
  };

  return <Row gutter={16}>{fields.map((fc, idx) => renderField(fc, idx))}</Row>;
};
