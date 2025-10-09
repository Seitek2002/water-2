import { FC, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Button } from 'antd';
import { DownloadOutlined, PlusOutlined } from '@ant-design/icons';
import { Table } from 'common/ui';
import CustomPagination from 'common/ui/Pagination/CustomPagination';
import { DashboardLayout, FilterBar } from 'components';
import type { FilterValues } from 'components/FilterBar/FilterBar';
import { getColumns } from './Customers.helpers';
import './styles.scss';

import { ICustomer, useGetAllCustomersQuery } from 'api/Customer.api';
import { usePermissions } from 'hooks/useAuth';

interface IProps {
  title: string;
}

export const Customers: FC<IProps> = ({ title }) => {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const { t } = useTranslation();

  const CATEGORY_OPTIONS = useMemo(
    () => [
      { value: '', label: t('common.all') },
      { value: '0', label: t('customers.category.legalShort') },
      { value: '1', label: t('customers.category.physicalShort') }
    ],
    [t]
  );

  const ALPHABET_OPTIONS = useMemo(
    () => [
      { value: 'full_name', label: t('filterBar.alphabetAsc') },
      { value: '-full_name', label: t('filterBar.alphabetDesc') }
    ],
    [t]
  );

  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get('page')) > 0 ? Number(searchParams.get('page')) : 1;
  const pageSize = Number(searchParams.get('page_size')) > 0 ? Number(searchParams.get('page_size')) : 8;

  const s = (key: string) => searchParams.get(key) || undefined;
  const search = s('search') || '';
  const category = (s('category') as '0' | '1' | undefined) || undefined;
  const alphabet = s('alphabet');
  const date = s('date');
  const ordering = [alphabet, date].filter(Boolean).join(', ');

  const { data, isLoading } = useGetAllCustomersQuery({
    page,
    page_size: pageSize,
    search: search || undefined,
    category,
    ordering
  });

  const handleFilterChange = (filter: FilterValues) => {
    const next = new URLSearchParams(searchParams);
    const setOrDelete = (key: string, val?: string | null) => {
      if (!val || val.length === 0) next.delete(key);
      else next.set(key, String(val));
    };

    setOrDelete('search', filter.search || '');
    setOrDelete('category', (filter.category as string) || '');
    setOrDelete('alphabet', filter.alphabet || '');
    setOrDelete('date', filter.date || '');

    next.set('page', '1'); // сбрасываем на первую страницу при фильтрации
    setSearchParams(next, { replace: false });
  };

  const onAddClick = () => {
    navigate('/dashboard/add-customer');
  };

  const onDownloadClick = () => {
    navigate('/dashboard/export-data');
  };

  // Преобразование данных к формату таблицы
  const tableData = useMemo(() => {
    return (data?.results || []).map((item: ICustomer, idx: number) => ({
      key: String(item.id),
      number: String((page - 1) * pageSize + idx + 1),
      customer: item.full_name,
      categories: (item.category === '1' ? 1 : 0) as 0 | 1,
      passportData: item.pasport || '',
      registrationDate: item.created_at ? new Date(item.created_at).toLocaleDateString() : '',
      address: item.address,
      contacts: item.contact,
      status: (item.status === 'active' ? 'active' : 'inactive') as 'active' | 'inactive',
      action: 'Редактировать'
    }));
  }, [data, page, pageSize]);

  const columns = useMemo(() => {
    return getColumns({
      onClick: (record, action) => {
        switch (action) {
          case 'details':
            navigate(`/dashboard/customers/${record.key}`);
            break;
          case 'registrationDate':
            navigate(`/dashboard/customers/${record.key}`);
            break;
          case 'edit':
            navigate(`/dashboard/customers/${record.key}/edit`);
            break;
          case 'delete':
            // Можно реализовать удаление
            break;
        }
      },
      hasPermission,
      t
    });
  }, [navigate, hasPermission, t]);

  const handlePaginationChange = (newPage: number, newPageSize?: number) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(newPage));
    if (newPageSize) next.set('page_size', String(newPageSize));
    setSearchParams(next, { replace: false });
  };

  return (
    <DashboardLayout title={t(title)}>
      <div className='customers-page'>
        <FilterBar
          initialValues={{ search, category, alphabet: alphabet || undefined, date: date || undefined }}
          onFilterChange={handleFilterChange}
          showAlphabet
          showCategory
          showDate
          categoryOptions={CATEGORY_OPTIONS}
          alphabetOptions={ALPHABET_OPTIONS}
          actionButtons={
            <>
              {hasPermission('add_customer') && (
                <Button type='primary' icon={<PlusOutlined />} onClick={onAddClick}>
                  {t('filterBar.add')}
                </Button>
              )}
              <Button icon={<DownloadOutlined />} iconPosition='end' onClick={onDownloadClick}>
                {t('common.export')}
              </Button>
            </>
          }
        />
        <Table pagination={false} columns={columns} dataSource={tableData} bordered scroll={{ x: 'max-content' }} loading={isLoading} />
        <CustomPagination current={page} pageSize={pageSize} total={data?.count || 0} onChange={handlePaginationChange} />
      </div>
    </DashboardLayout>
  );
};
