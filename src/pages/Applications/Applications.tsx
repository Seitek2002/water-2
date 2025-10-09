import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Button, message, Table } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import CustomPagination from 'common/ui/Pagination/CustomPagination';
import { DashboardLayout } from 'components/DashboardLayout';
import { FilterBar } from 'components/FilterBar';
import { RejectApplicationModal } from 'components/Modal';
import { ApplicationData, getColumns } from './Applications.helpers';

import { useApproveApplicationMutation, useGetApplicationsQuery } from 'api/Application.api';
import { RefusalBody, useCreateRefusalMutation } from 'api/Refusal.api';
import { useCreateTyFromApplicationMutation } from 'api/Ty.api';
import { usePermissions } from 'hooks/useAuth';
import { t } from 'i18next';

type FilterValues = {
  search?: string;
  alphabet?: string;
  type?: string;
  status?: string;
  date?: string;
};

interface IProps {
  title: string;
}

const STATUS_OPTIONS = [
  { value: '', label: t('applications.tabs.all') },
  { value: 'pending', label: t('applications.statusTag.pending') },
  { value: 'rejected', label: t('applications.statusTag.rejected') },
  { value: 'approved', label: t('applications.statusTag.approved') },
  { value: 'contracted', label: t('applications.statusTag.contracted') }
];

export const Applications: FC<IProps> = ({ title }) => {
  const navigate = useNavigate();
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const { hasPermission } = usePermissions();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get('page')) > 0 ? Number(searchParams.get('page')) : 1;
  const pageSize = Number(searchParams.get('page_size')) > 0 ? Number(searchParams.get('page_size')) : 8;
  const status = searchParams.get('status') || '';
  const ordering = searchParams.get('ordering') || '-created_at';
  const search = searchParams.get('search') || '';

  const { data, isLoading, refetch } = useGetApplicationsQuery(
    {
      search: debouncedSearch || undefined,
      status: (status || undefined) as 'pending' | 'rejected' | 'approved' | 'contracted' | undefined,
      page,
      page_size: pageSize,
      ordering
    },
    { refetchOnMountOrArgChange: true }
  );
  const [approveApplications, { isSuccess: isApproveSuccess, isError: isApproveError }] = useApproveApplicationMutation();
  const [createRefuse, { isSuccess: isRejectSuccess, isError: isRejectError }] = useCreateRefusalMutation();
  const [createTy] = useCreateTyFromApplicationMutation();

  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<string>();

  const openRejectModal = useCallback((applicationId: string) => {
    setSelectedApplication(applicationId);
    setIsRejectModalOpen(true);
  }, []);

  const closeRejectModal = () => {
    setIsRejectModalOpen(false);
    setSelectedApplication(undefined);
  };

  const handleReject = (values: RefusalBody) => {
    closeRejectModal();
    createRefuse({ ...values, application: selectedApplication || '' });
  };

  // Debounce для поиска
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  // Обработка фильтрации из FilterBar
  const handleFilterChange = useCallback(
    (filter: FilterValues) => {
      const next = new URLSearchParams(searchParams);
      const setOrDelete = (key: string, val?: string | null) => {
        if (!val || val.length === 0) next.delete(key);
        else next.set(key, String(val));
      };
      setOrDelete('search', filter.search || '');
      setOrDelete('status', filter.status || '');
      setOrDelete('ordering', filter.date || '');
      next.set('page', '1'); // сброс на первую страницу при смене фильтров
      setSearchParams(next, { replace: false });
    },
    [searchParams, setSearchParams]
  );

  // Преобразование данных к формату таблицы (если нужно)
  const tableData: ApplicationData[] = useMemo(() => {
    return (data?.results || []).map((item) => ({
      key: String(item.id),
      id: String(item.id),
      date: item.created_at ? dayjs(item.created_at).format('DD.MM.YYYY-HH:mm') : '',
      customer: item.customer.full_name, // временно используем id как строку, если нет имени
      customerId: item.customer.id,
      address: item.address,
      objectName: item.object,
      waterAmount: item.waterRequired,
      wastewaterAmount: item.firefightingExpenses,
      status: item.status as 'approved' | 'rejected' | 'pending' | 'contracted',
      rejectReason: undefined,
      comment: undefined,
      hasTu: item.status === 'contracted',
      ty_id: item.ty_id
    }));
  }, [data]);

  const columns = useMemo(() => {
    return getColumns({
      onClick: (record, action) => {
        switch (action) {
          case 'create':
            navigate(`/dashboard/add-tu-forms/${record.ty_id}`);
            break;
          case 'tuDetails':
            if (record.ty_id) {
              navigate(`/dashboard/technical-conditions/tu-details/${record.ty_id}`);
            }
            break;
          case 'reject':
            openRejectModal(String(record.id));
            break;
          case 'approve':
            createTy({ application_id: Number(record.id) });
            approveApplications({ applicationId: String(record.id) });
            break;
          case 'applicationView':
            navigate(`/dashboard/applications/${record.id}`);
            break;
          case 'customerView':
            navigate(`/dashboard/customers/${record.customerId}`);
            break;
        }
      },
      hasPermission
    });
  }, [approveApplications, createTy, hasPermission, navigate, openRejectModal]);

  const onAddClick = () => {
    navigate('create');
  };

  const handlePaginationChange = (newPage: number, newPageSize?: number) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(newPage));
    if (newPageSize) next.set('page_size', String(newPageSize));
    setSearchParams(next, { replace: false });
  };

  useEffect(() => {
    if (isApproveSuccess) {
      message.success('Заявка одобрена');
    }

    if (isApproveError) {
      message.error('Ошибка при одобрении заявки');
    }

    if (isRejectSuccess) {
      message.success('Заявка отклонена');
    }

    if (isRejectError) {
      message.error('Ошибка при отклонении заявки');
    }
  }, [isApproveError, isApproveSuccess, isRejectError, isRejectSuccess]);

  useEffect(() => {
    if (isApproveSuccess || isRejectSuccess) {
      refetch();
    }
  }, [isApproveSuccess, isRejectSuccess, refetch]);

  return (
    <DashboardLayout title={t(title)}>
      <FilterBar
        initialValues={{ search, status, date: ordering }}
        onFilterChange={handleFilterChange}
        showStatusSelect
        showDate
        statusOptions={STATUS_OPTIONS}
        actionButtons={
          <>
            {hasPermission('add_application') && (
              <Button type='primary' icon={<PlusOutlined />} onClick={onAddClick}>
                {t('filterBar.add')}
              </Button>
            )}
          </>
        }
      />
      <Table pagination={false} columns={columns} dataSource={tableData} bordered scroll={{ x: 'max-content' }} loading={isLoading} />
      <CustomPagination current={page} pageSize={pageSize} total={data?.count || 0} onChange={handlePaginationChange} />
      <RejectApplicationModal open={isRejectModalOpen} onCancel={closeRejectModal} onReject={handleReject} />
    </DashboardLayout>
  );
};
