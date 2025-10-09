import { useEffect, useState } from 'react';
import { Input, Select, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import './styles.scss';

import { t } from 'i18next';

const { Option } = Select;

export interface FilterValues {
  search?: string;
  alphabet?: string;
  type?: string;
  status?: string;
  date?: string;
  category?: string;
}

interface Props {
  initialValues?: FilterValues;
  onFilterChange: (values: FilterValues) => void;
  alphabetOptions?: { value: string; label: string }[];
  showAlphabet?: boolean;
  showType?: boolean;
  showStatus?: boolean;
  showDate?: boolean;
  showCategory?: boolean;
  categoryOptions?: { value: string; label: string }[];
  showStatusSelect?: boolean;
  statusOptions?: { value: string; label: string }[];
  actionButtons?: React.ReactNode;
  showSearch?: boolean;
}

export const FilterBar = ({
  initialValues,
  onFilterChange,
  showAlphabet,
  showDate,
  showStatus,
  showType,
  showCategory,
  categoryOptions,
  showStatusSelect,
  statusOptions,
  actionButtons,
  alphabetOptions,
  showSearch = true
}: Props) => {
  const [values, setValues] = useState<FilterValues>(() => initialValues || {});

  useEffect(() => {
    // Синхронизируем внутреннее состояние с начальными значениями (например, при смене URL)
    setValues(initialValues || {});
  }, [initialValues]);

  const handleChange = (key: keyof FilterValues, value: string) => {
    const newValues = { ...values, [key]: value };
    setValues(newValues);
    onFilterChange(newValues);
  };

  return (
    <div className='filter-bar'>
      <Space style={{ flexWrap: 'wrap', rowGap: 12 }}>
        {showSearch && (
          <Input
            prefix={<SearchOutlined />}
            placeholder={t('filterBar.search')}
            allowClear
            value={values.search}
            onChange={(e) => handleChange('search', e.target.value)}
            style={{ width: 180 }}
          />
        )}

        {showAlphabet && !alphabetOptions && (
          <Select
            variant='filled'
            placeholder={t('filterBar.filter.alphabet')}
            allowClear
            style={{ width: 140 }}
            value={values.alphabet}
            onChange={(v) => handleChange('alphabet', v)}
          >
            <Option value='asc'>{t('filterBar.alphabetAsc')}</Option>
            <Option value='desc'>{t('filterBar.alphabetDesc')}</Option>
          </Select>
        )}

        {showAlphabet && alphabetOptions && (
          <Select
            variant='filled'
            placeholder={t('filterBar.filter.alphabet')}
            allowClear
            style={{ width: 140 }}
            value={values.alphabet}
            onChange={(v) => handleChange('alphabet', v)}
          >
            {alphabetOptions.map((opt) => (
              <Option key={opt.value} value={opt.value}>
                {opt.label}
              </Option>
            ))}
          </Select>
        )}

        {showCategory && categoryOptions && (
          <Select
            variant='filled'
            placeholder={t('filterBar.filter.category')}
            allowClear
            style={{ width: 140 }}
            value={values.category}
            onChange={(v) => handleChange('category', v)}
          >
            {categoryOptions.map((opt) => (
              <Option key={opt.value} value={opt.value}>
                {opt.label}
              </Option>
            ))}
          </Select>
        )}

        {showStatusSelect && statusOptions && (
          <Select
            variant='filled'
            placeholder={t('filterBar.filter.status')}
            allowClear
            style={{ width: 140 }}
            value={values.status}
            onChange={(v) => handleChange('status', v)}
          >
            {statusOptions.map((opt) => (
              <Option key={opt.value} value={opt.value}>
                {opt.label}
              </Option>
            ))}
          </Select>
        )}

        {showType && (
          <Select
            variant='filled'
            placeholder={t('filterBar.filter.type')}
            allowClear
            style={{ width: 140 }}
            value={values.type}
            onChange={(v) => handleChange('type', v)}
          >
            <Option value='residential'>{t('filterBar.residential')}</Option>
            <Option value='commercial'>{t('filterBar.commercial')}</Option>
          </Select>
        )}

        {showStatus && (
          <Select
            variant='filled'
            placeholder={t('filterBar.filter.status')}
            allowClear
            style={{ width: 140 }}
            value={values.status}
            onChange={(v) => handleChange('status', v)}
          >
            <Option value='approved'>{t('filterBar.approved')}</Option>
            <Option value='rejected'>{t('filterBar.rejected')}</Option>
          </Select>
        )}

        {showDate && (
          <Select
            variant='filled'
            placeholder={t('filterBar.byDate')}
            allowClear
            style={{ width: 140 }}
            value={values.date}
            onChange={(v) => handleChange('date', v)}
          >
            <Option value='-created_at'>{t('filterBar.newOnesfirst')}</Option>
            <Option value='created_at'>{t('filterBar.newOldFirst')}</Option>
          </Select>
        )}
      </Space>
      <Space>{actionButtons}</Space>
    </div>
  );
};
