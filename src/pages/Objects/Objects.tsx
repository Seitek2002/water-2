import React, { FC, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Col, Empty, message, Row, Spin } from 'antd';
import CustomPagination from 'common/ui/Pagination/CustomPagination';
import { DashboardLayout } from 'components/DashboardLayout';
import { ObjectCard } from 'components/ObjectCard/ObjectCard';
import { ObjectForm, ObjectFormData } from 'components/ObjectForm/ObjectForm';
import { ObjectsFilters } from 'components/ObjectsFilters';
import { IGetObjectParams, ObjectFilters } from 'types/entities/objects';

import { useCreateObjectMutation, useGetAllObjectsQuery, useUpdateObjectTitleMutation } from 'api/Object.api';
import { t } from 'i18next';

interface ObjectsProps {
  title: string;
}

interface ApiError {
  data?: Record<string, string | string[]>;
  message?: string;
}

export const Objects: FC<ObjectsProps> = ({ title }) => {
  const navigate = useNavigate();
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get('page')) > 0 ? Number(searchParams.get('page')) : 1;
  const pageSize = Number(searchParams.get('page_size')) > 0 ? Number(searchParams.get('page_size')) : 12;

  const filters: ObjectFilters = {
    search: searchParams.get('search') || '',
    status: (searchParams.get('status') as 'active' | 'inactive' | null) || null,
    date: (searchParams.get('date') as string) || '-created_at'
  };

  // Подготавливаем параметры для API с обязательными page и page_size
  const queryParams: IGetObjectParams = {
    page,
    page_size: pageSize,
    search: filters.search || undefined,
    status: (filters.status as 'active' | 'inactive') || undefined,
    ordering: filters.date || '' // Сортировка по дате создания (новые сначала)
  };

  const { data: objectsResponse, isLoading, error } = useGetAllObjectsQuery(queryParams);
  const [updateObjectTitle] = useUpdateObjectTitleMutation();
  const [createObject, { isLoading: isCreating }] = useCreateObjectMutation();

  const objects = objectsResponse?.results || [];

  const filteredObjects = React.useMemo(() => {
    let filtered = objects;

    if (filters.date) {
      const now = new Date();
      filtered = filtered.filter((obj) => {
        const objDate = new Date(obj.created_at);
        let compareDate: Date;

        switch (filters.date) {
          case 'month':
            compareDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
            break;
          case 'quarter':
            compareDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
            break;
          case 'year':
            compareDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
            break;
          default:
            return true;
        }

        return objDate >= compareDate;
      });
    }

    return filtered;
  }, [objects, filters.date]);

  const handleFilterChange = (filterType: keyof ObjectFilters, value: string | null): void => {
    const next = new URLSearchParams(searchParams);
    if (value === null || value === '' || value === 'null') {
      next.delete(filterType as string);
    } else {
      next.set(filterType as string, String(value));
    }
    // reset page on filter change
    next.set('page', '1');
    next.set('page_size', String(pageSize));
    setSearchParams(next, { replace: false });
  };

  const handleSearchChange = (value: string): void => {
    const next = new URLSearchParams(searchParams);
    if (value && value.trim().length > 0) next.set('search', value);
    else next.delete('search');
    next.set('page', '1'); // reset page on new search
    setSearchParams(next, { replace: false });
  };

  const handleAddNew = (): void => {
    setShowAddForm(true);
  };

  const handleCreateObject = async (formData: ObjectFormData): Promise<void> => {
    try {
      const objectData = {
        title: formData.title,
        address_street: formData.address_street,
        address_number: formData.address_number || '',
        kadastr_number: formData.kadastr_number,
        status: formData.status
      };

      await createObject(objectData).unwrap();
      message.success(t('objects.messages.created'));
      setShowAddForm(false);
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
        message.error(t('objects.messages.createError'));
      }
      console.error('Create object error:', error);
    }
  };

  const handleCancelCreate = (): void => {
    setShowAddForm(false);
  };

  const handleTitleChange = async (id: number, newTitle: string): Promise<void> => {
    try {
      await updateObjectTitle({
        id,
        title: newTitle
      }).unwrap();
      message.success(t('objectDetail.titleUpdated'));
    } catch (error) {
      message.error(t('objectDetail.errorUpdateTitle'));
      console.error('Update title error:', error);
    }
  };

  const handleCardClick = (id: number): void => {
    navigate(`/dashboard/objects/${id}`);
  };

  if (error) {
    message.error(t('objects.messages.loadError'));
  }

  const handlePaginationChange = (newPage: number, newPageSize?: number) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(newPage));
    next.set('page_size', String(newPageSize ?? pageSize));
    setSearchParams(next, { replace: false });
  };

  return (
    <DashboardLayout title={t(title)}>
      <ObjectsFilters filters={filters} onSearchChange={handleSearchChange} onFilterChange={handleFilterChange} onAddNew={handleAddNew} />
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <Spin size='large' />
        </div>
      ) : filteredObjects.length > 0 ? (
        <Row gutter={[16, 0]}>
          {filteredObjects.map((object) => (
            <Col xs={24} sm={12} md={8} lg={6} xl={6} key={object.id}>
              <ObjectCard object={object} onTitleChange={handleTitleChange} onCardClick={handleCardClick} />
            </Col>
          ))}
        </Row>
      ) : (
        <Empty description={t('objects.notFound')} style={{ marginTop: '50px' }} />
      )}
      <CustomPagination current={page} pageSize={pageSize} total={objectsResponse?.count || 0} onChange={handlePaginationChange} />
      {showAddForm && <ObjectForm onSubmit={handleCreateObject} onCancel={handleCancelCreate} loading={isCreating} />}
    </DashboardLayout>
  );
};
