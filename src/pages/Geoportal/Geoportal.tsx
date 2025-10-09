import { type FC, useEffect, useMemo, useState } from 'react';
import { Button, Flex, message, Spin, Typography } from 'antd';
import { DashboardLayout } from 'components/DashboardLayout';
import { Filters, GeoportalFilters } from 'components/GeoportalFilters/GeoportalFilters';
import { MapObjectCard } from 'components/MapObjectCard/MapObjectCard';
import { YandexMap } from 'components/YandexMap/YandexMap';

import { type MapObject, useGetAllMapObjectsQuery } from 'api/GeoPartal.api';
import { t } from 'i18next';
import { applyFilters } from 'utils/mapHelpers';

const { Text } = Typography;

interface GeoportalProps {
  title: string;
}

const INITIAL_FILTERS: Filters = {
  search: '',
  status: null
};

export const Geoportal: FC<GeoportalProps> = ({ title }) => {
  const [selectedObject, setSelectedObject] = useState<MapObject | null>(null);
  const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS);

  const {
    data: apiResponse,
    isLoading,
    error,
    refetch
  } = useGetAllMapObjectsQuery(undefined, {
    skip: false,
    refetchOnMountOrArgChange: true,
    refetchOnFocus: false,
    refetchOnReconnect: false
  });

  const objects = useMemo(() => apiResponse?.results || [], [apiResponse]);

  const filteredObjects = useMemo(() => {
    if (objects.length === 0) {
      return [];
    }
    return applyFilters(objects, filters);
  }, [objects, filters]);

  useEffect(() => {
    if (error) {
      message.error(t('geoportal.errorLoad'));
      console.error('API Error:', error);
    }
  }, [error]);

  const handleFilterChange = (filterType: keyof Filters, value: string | null): void => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value
    }));
    setSelectedObject(null);
  };

  const handleSearchChange = (value: string): void => {
    setFilters((prev) => ({
      ...prev,
      search: value
    }));
    setSelectedObject(null);
  };

  const handleRefresh = async (): Promise<void> => {
    try {
      await refetch().unwrap();
      message.success(t('geoportal.dataRefreshed'));
    } catch (refreshError) {
      message.error(t('geoportal.apiError'));
      console.error('Refresh Error:', refreshError);
    }
  };

  const handleResetFilters = (): void => {
    setFilters(INITIAL_FILTERS);
    setSelectedObject(null);
  };

  const hasActiveFilters = Boolean(filters.search || filters.status);

  if (isLoading) {
    return (
      <DashboardLayout title={t(title)}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '400px'
          }}
        >
          <Spin size='large' />
          <Text style={{ marginLeft: 16 }}>{t('geoportal.loading')}</Text>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title={t(title)}>
        <div
          style={{
            textAlign: 'center',
            padding: '40px 20px',
            background: '#fff',
            borderRadius: 8,
            border: '1px solid #f0f0f0'
          }}
        >
          <Text type='danger' style={{ fontSize: 16 }}>
            {t('geoportal.apiError')}
          </Text>
          <div style={{ marginTop: 16 }}>
            <Button type='primary' onClick={handleRefresh}>
              {t('geoportal.tryAgain')}
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={t(title)}>
      <GeoportalFilters
        filters={filters}
        onSearchChange={handleSearchChange}
        onFilterChange={handleFilterChange}
        onRefresh={handleRefresh}
        isLoading={isLoading}
        totalCount={objects.length}
        filteredCount={filteredObjects.length}
      />

      <Flex gap={16} wrap='wrap'>
        <div style={{ flex: 1, minWidth: '600px' }}>
          <YandexMap objects={filteredObjects} onSelect={setSelectedObject} />
        </div>

        {selectedObject && (
          <div style={{ minWidth: '300px', maxWidth: '400px' }}>
            <MapObjectCard selectedObject={selectedObject} />
          </div>
        )}
      </Flex>

      <Flex justify='space-between' align='center' style={{ marginTop: 16 }}>
        <Text type='secondary'>{t('geoportal.foundCount', { count: filteredObjects.length, total: objects.length })}</Text>

        {hasActiveFilters && (
          <Button type='link' size='small' onClick={handleResetFilters}>
            {t('geoportal.resetFilters')}
          </Button>
        )}
      </Flex>
    </DashboardLayout>
  );
};

export default Geoportal;
