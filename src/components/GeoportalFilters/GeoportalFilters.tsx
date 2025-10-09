import React, { type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge, Button, Dropdown, Flex, Input, type MenuProps, Space, Tooltip } from 'antd';
import { ClearOutlined, DownOutlined, FilterOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';

export interface Filters {
  search: string;
  status: string | null;
}

interface GeoportalFiltersProps {
  filters: Filters;
  onSearchChange: (value: string) => void;
  onFilterChange: (filterType: keyof Filters, value: string | null) => void;
  onRefresh: () => void;
  isLoading: boolean;
  totalCount?: number;
  filteredCount?: number;
}

export const GeoportalFilters: FC<GeoportalFiltersProps> = ({
  filters,
  onSearchChange,
  onFilterChange,
  onRefresh,
  isLoading,
  totalCount = 0,
  filteredCount = 0
}) => {
  const { t } = useTranslation();

  const getFilterLabel = (items: MenuProps['items'], key: string | null): string => {
    if (!key) {
      const firstItem = items?.[0];
      return firstItem && typeof firstItem === 'object' && 'label' in firstItem ? (firstItem.label as string) : '';
    }

    const item = items?.find(
      (item): item is { label: React.ReactNode; key: string } =>
        typeof item === 'object' && item !== null && 'key' in item && item.key === key && 'label' in item
    );

    return item ? (item.label as string) : '';
  };

  const statusItems: MenuProps['items'] = [
    { label: t('geoportalFilters.status.all'), key: 'all' },
    { label: `✅ ${t('geoportalFilters.status.active')}`, key: 'active' },
    { label: `❌ ${t('geoportalFilters.status.inactive')}`, key: 'inactive' },
    { label: `📦 ${t('tuDetails.status.archived')}`, key: 'archived' }
  ];

  const handleStatusFilter: MenuProps['onClick'] = (e) => {
    const status = e.key === 'all' ? null : e.key;
    onFilterChange('status', status);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    onSearchChange(e.target.value);
  };

  const hasActiveFilters = Boolean(filters.search || filters.status);
  const activeFiltersCount = [filters.search, filters.status].filter(Boolean).length;

  const handleResetFilters = (): void => {
    onFilterChange('status', null);
    onSearchChange('');
  };

  const handleClearSearch = (): void => {
    onSearchChange('');
  };

  return (
    <Flex gap={12} style={{ marginBottom: 16 }} wrap='wrap' align='center'>
      <Input
        prefix={<SearchOutlined />}
        placeholder={t('geoportalFilters.searchPlaceholder')}
        value={filters.search}
        onChange={handleSearchChange}
        style={{ minWidth: 300, maxWidth: 400 }}
        allowClear={{
          clearIcon: <ClearOutlined onClick={handleClearSearch} />
        }}
        disabled={isLoading}
      />

      <Badge count={filters.status ? 1 : 0} size='small'>
        <Dropdown
          menu={{
            items: statusItems,
            onClick: handleStatusFilter,
            selectedKeys: filters.status ? [filters.status] : ['all']
          }}
          disabled={isLoading}
        >
          <Button>
            <Space>
              <FilterOutlined />
              {getFilterLabel(statusItems, filters.status)}
              <DownOutlined />
            </Space>
          </Button>
        </Dropdown>
      </Badge>

      <Tooltip title={t('common.refresh')}>
        <Button icon={<ReloadOutlined />} onClick={onRefresh} loading={isLoading} />
      </Tooltip>

      {hasActiveFilters && (
        <Tooltip title={`${t('geoportal.resetFilters')} (${activeFiltersCount})`}>
          <Button type='text' icon={<ClearOutlined />} onClick={handleResetFilters} disabled={isLoading} danger>
            {t('geoportal.resetFilters')} ({activeFiltersCount})
          </Button>
        </Tooltip>
      )}

      {(totalCount > 0 || filteredCount > 0) && (
        <div style={{ marginLeft: 'auto', fontSize: '12px', color: '#666' }}>
          <span>
            {t('geoportal.foundCount', {
              count: hasActiveFilters ? filteredCount : totalCount,
              total: totalCount
            })}
          </span>
        </div>
      )}
    </Flex>
  );
};
