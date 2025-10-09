import React, { FC } from 'react';
import { Button, Flex, Input, Space } from 'antd';
import { Dropdown } from 'antd';
import { DownOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { ObjectFilters } from 'types/entities/objects';

import { usePermissions } from 'hooks/useAuth';
import { t } from 'i18next';

interface ObjectsFiltersProps {
  filters: ObjectFilters;
  onSearchChange: (value: string) => void;
  onFilterChange: (filterType: keyof ObjectFilters, value: string | null) => void;
  onAddNew: () => void;
}

interface MenuItem {
  label: string;
  key: string;
}

const statusItems: MenuItem[] = [
  { label: t('geoportalFilters.dropdown.status'), key: 'all' },
  { label: t('geoportalFilters.status.active'), key: 'active' },
  { label: t('geoportalFilters.status.inactive'), key: 'inactive' }
];

const dateItems: MenuItem[] = [
  {
    label: t('filterBar.newOnesfirst'),
    key: 'created_at'
  },
  {
    label: t('filterBar.newOldFirst'),
    key: '-created_at'
  }
];

export const ObjectsFilters: FC<ObjectsFiltersProps> = ({ filters, onSearchChange, onFilterChange, onAddNew }) => {
  const { hasPermission } = usePermissions();
  const getFilterLabel = (items: MenuItem[], key: string | null): string => {
    if (!key) return items[0]?.label || '';
    const item = items.find((item) => item.key === key);
    return item?.label || items[0]?.label || '';
  };

  const handleStatusFilter = (e: { key: string }): void => {
    const status = e.key === 'all' ? null : e.key;
    onFilterChange('status', status);
  };

  const handleDateFilter = (e: { key: string }): void => {
    const date = e.key === 'all' ? null : e.key;
    onFilterChange('date', date);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    onSearchChange(e.target.value);
  };

  return (
    <Flex gap={12} style={{ marginBottom: 24 }}>
      <Input
        prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
        placeholder={t('objects.searchPlaceholder')}
        value={filters.search}
        onChange={handleSearchChange}
        style={{
          width: 350,
          backgroundColor: '#f5f5f7',
          border: 'none',
          borderRadius: 12
        }}
      />

      <Dropdown menu={{ items: statusItems, onClick: handleStatusFilter }} trigger={['click']}>
        <Button
          style={{
            borderRadius: 12,
            backgroundColor: '#f5f5f7',
            border: 'none',
            color: '#8e8e93'
          }}
        >
          <Space>
            {getFilterLabel(statusItems, filters.status)}
            <DownOutlined />
          </Space>
        </Button>
      </Dropdown>

      <Dropdown menu={{ items: dateItems, onClick: handleDateFilter }} trigger={['click']}>
        <Button
          style={{
            borderRadius: 12,
            backgroundColor: '#f5f5f7',
            border: 'none',
            color: '#8e8e93'
          }}
        >
          <Space>
            {getFilterLabel(dateItems, filters.date)}
            <DownOutlined />
          </Space>
        </Button>
      </Dropdown>

      {hasPermission('add_entity') && (
        <Button
          type='primary'
          icon={<PlusOutlined />}
          onClick={onAddNew}
          style={{
            borderRadius: 12,
            backgroundColor: '#007aff',
            borderColor: '#007aff'
          }}
        >
          {t('filterBar.add')}
        </Button>
      )}
    </Flex>
  );
};
