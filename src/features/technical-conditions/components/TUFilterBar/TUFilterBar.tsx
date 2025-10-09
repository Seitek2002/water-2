import { useEffect, useState } from 'react';
import { Badge, Button, Col, Form, Input, InputNumber, Row, Select, Space } from 'antd';
import { DownloadOutlined, FilterOutlined, PlusOutlined, SaveOutlined, SearchOutlined } from '@ant-design/icons';
import { IStageEnum, IStatus6b3Enum } from 'types/common';
import { IFilterPreset } from 'types/requests';
import './styles.scss';

import { useGetTypesTyQuery } from 'api/Ty.api';
import { t } from 'i18next';

const { Option } = Select;

interface TUFilterValues {
  search?: string;
  ordering?: string;
  payment_ordering?: string;
  stage?: IStageEnum;
  status?: IStatus6b3Enum;
  date?: string;
  has_invoice?: boolean;
  overdue?: boolean;
  due_in_days?: number;
  type_ty?: number;
  id?: number;
  address?: string;
  payment_amount?: number;
  tu_with_loads?: boolean;
}

interface Props {
  initialValues?: TUFilterValues;
  onFilterChange: (values: TUFilterValues) => void;
  onAddClick: () => void;
  onDownloadClick: (presetId?: number | string) => void;

  // Presets
  presets?: IFilterPreset[];
  presetsLoading?: boolean;
  onApplyPreset?: (preset: IFilterPreset) => void;
  onRequestSavePreset?: () => void;
}

export const TUFilterBar = ({
  onFilterChange,
  onAddClick,
  onDownloadClick,
  initialValues,
  presets,
  presetsLoading,
  onApplyPreset,
  onRequestSavePreset
}: Props) => {
  const [form] = Form.useForm();
  const { data: typesTy } = useGetTypesTyQuery();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activeCount, setActiveCount] = useState(0);
  const [selectedPresetId, setSelectedPresetId] = useState<number | string | undefined>(undefined);

  const handlePresetSelect = (id: number | string) => {
    setSelectedPresetId(id);
    const preset = (presets || []).find((p) => p.id === id);
    if (preset && onApplyPreset) onApplyPreset(preset);
  };

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        has_invoice: initialValues.has_invoice === undefined ? undefined : String(initialValues.has_invoice),
        overdue: initialValues.overdue === undefined ? undefined : String(initialValues.overdue),
        tu_with_loads: initialValues.tu_with_loads === undefined ? undefined : String(initialValues.tu_with_loads)
      });
      // init active filters counter
      {
        const iv = initialValues as TUFilterValues;
        const ignore = ['search'] as (keyof TUFilterValues)[];
        const cnt = Object.entries(iv || {}).filter(
          ([k, v]) => !ignore.includes(k as keyof TUFilterValues) && v !== undefined && v !== null && String(v).trim() !== ''
        ).length;
        setActiveCount(cnt);
      }
    }
  }, [form, initialValues]);

  const computeActiveCount = (vals: TUFilterValues) => {
    const ignore = ['search'] as (keyof TUFilterValues)[];
    return Object.entries(vals || {}).filter(
      ([k, v]) => !ignore.includes(k as keyof TUFilterValues) && v !== undefined && v !== null && String(v).trim() !== ''
    ).length;
  };

  const handleValuesChange = (_: unknown, allValues: TUFilterValues) => {
    setActiveCount(computeActiveCount(allValues));
    onFilterChange(allValues);
  };
  const filtersContent = (
    <div className='tu-filters-panel'>
      <div className='tu-filters-header'>
        <span>{t('filterBar.filters')}</span>
        <Space size={8}>
          <Button size='small' type='text' onClick={() => setFiltersOpen(false)}>
            {t('common.cancel')}
          </Button>
        </Space>
      </div>

      <Form form={form} layout='vertical' onValuesChange={handleValuesChange}>
        <Row gutter={[12, 12]}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item name='ordering' label={t('filterBar.filter.alphabet')}>
              <Select variant='filled' allowClear style={{ width: '100%' }}>
                <Option value='object_name'>{t('filterBar.alphabetAsc')}</Option>
                <Option value='-object_name'>{t('filterBar.alphabetDesc')}</Option>
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item name='status' label={t('filterBar.filter.status')}>
              <Select variant='filled' allowClear style={{ width: '100%' }}>
                <Option value='active'>{t('filterBar.approved')}</Option>
                <Option value='inactive'>{t('filterBar.rejected')}</Option>
                <Option value='archived'>{t('filterBar.archived')}</Option>
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item name='stage' label={t('tuDetails.labels.stage')}>
              <Select variant='filled' allowClear style={{ width: '100%' }}>
                <Option value='draft'>{t('tuDetails.stage.draft')}</Option>
                <Option value='review'>{t('tuDetails.stage.review')}</Option>
                <Option value='approved'>{t('tuDetails.stage.approved')}</Option>
                <Option value='done'>{t('tuDetails.stage.done')}</Option>
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item name='date' label={t('filterBar.byDate')}>
              <Select variant='filled' allowClear style={{ width: '100%' }}>
                <Option value='-created_at'>{t('filterBar.newOnesfirst')}</Option>
                <Option value='created_at'>{t('filterBar.newOldFirst')}</Option>
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item name='payment_ordering' label={t('tuDetails.titles.payment')}>
              <Select variant='filled' allowClear style={{ width: '100%' }}>
                <Option value='payment_deadline'>{t('filterBar.paymentDeadlineAsc')}</Option>
                <Option value='-payment_deadline'>{t('filterBar.paymentDeadlineDesc')}</Option>
                <Option value='payment_date'>{t('filterBar.paymentDateAsc')}</Option>
                <Option value='-payment_date'>{t('filterBar.paymentDateDesc')}</Option>
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item name='has_invoice' label={t('technicalConditions.filter.hasInvoice')}>
              <Select variant='filled' allowClear style={{ width: '100%' }}>
                <Option value='true'>{t('profile.yes')}</Option>
                <Option value='false'>{t('profile.no')}</Option>
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item name='overdue' label={t('technicalConditions.filter.overdue')}>
              <Select variant='filled' allowClear style={{ width: '100%' }}>
                <Option value='true'>{t('profile.yes')}</Option>
                <Option value='false'>{t('profile.no')}</Option>
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item name='due_in_days' label={t('technicalConditions.filter.dueInDays', 'Дни до срока оплаты')}>
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item name='type_ty' label={t('exportData.placeholders.selectTypeTU') || 'Выберите тип ТУ'}>
              <Select variant='filled' allowClear style={{ width: '100%' }}>
                {typesTy?.map((opt) => (
                  <Option key={opt.id} value={opt.id}>
                    {opt.title}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item name='id' label='ID'>
              <Input allowClear style={{ width: '100%' }} />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item name='address' label={t('tuDetails.labels.address')}>
              <Input allowClear style={{ width: '100%' }} />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item name='payment_amount' label={t('tuDetails.labels.paymentAmount')}>
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item name='tu_with_loads' label={t('technicalConditions.filter.tuWithLoads', 'ТУ с увеличением нагрузок')}>
              <Select variant='filled' allowClear style={{ width: '100%' }}>
                <Option value='true'>{t('profile.yes')}</Option>
                <Option value='false'>{t('profile.no')}</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Form>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
        <Button icon={<SaveOutlined />} onClick={() => onRequestSavePreset && onRequestSavePreset()}>
          {t('technicalConditions.presets.save', 'Сохранить шаблон')}
        </Button>
      </div>
    </div>
  );

  return (
    <div className='tu-filter-bar'>
      {/* Top bar shows only: Search, Add, Export, and Filters button */}
      <Form
        form={form}
        layout='inline'
        onValuesChange={handleValuesChange}
        initialValues={
          initialValues
            ? {
                ...initialValues,
                has_invoice: initialValues.has_invoice === undefined ? undefined : String(initialValues.has_invoice),
                overdue: initialValues.overdue === undefined ? undefined : String(initialValues.overdue),
                tu_with_loads: initialValues.tu_with_loads === undefined ? undefined : String(initialValues.tu_with_loads)
              }
            : undefined
        }
        style={{ flexWrap: 'wrap', rowGap: 12 }}
      >
        <Form.Item name='search'>
          <Input prefix={<SearchOutlined />} placeholder={t('filterBar.search')} allowClear />
        </Form.Item>
      </Form>

      <Space>
        <Button type='primary' icon={<PlusOutlined />} onClick={() => onAddClick()}>
          {t('filterBar.add')}
        </Button>

        <Button icon={<DownloadOutlined />} onClick={() => onDownloadClick(selectedPresetId)}>
          {t('common.export')}
        </Button>

        <Select
          showSearch
          allowClear
          placeholder={t('technicalConditions.presets.select', 'Выберите шаблон')}
          style={{ minWidth: 240 }}
          loading={presetsLoading}
          value={selectedPresetId}
          onChange={(val) => (val ? handlePresetSelect(val) : setSelectedPresetId(undefined))}
          filterOption={(input, option) => ((option?.label as string) || '').toLowerCase().includes(input.toLowerCase())}
          options={(presets || []).map((p) => ({ value: p.id, label: p.name }))}
        />

        <Badge count={activeCount} size='small' offset={[6, 0]} showZero={false}>
          <Button
            className={filtersOpen ? 'filters-btn filters-btn--active' : 'filters-btn'}
            icon={<FilterOutlined />}
            onClick={() => setFiltersOpen((o) => !o)}
          >
            {t('filterBar.filters')}
          </Button>
        </Badge>
      </Space>
      {filtersOpen ? <div>{filtersContent}</div> : null}
    </div>
  );
};
