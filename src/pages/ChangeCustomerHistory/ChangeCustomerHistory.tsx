import { FC, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { Table } from 'antd';
import CustomPagination from 'common/ui/Pagination/CustomPagination';
import { DashboardLayout } from 'components/DashboardLayout';
import { ICustomerChangeHistory } from 'types/entities';
import { getColumns } from './ChangeCustomerHistory.helpers';

import { useGetCustomerChangeHistoryQuery } from 'api/Customer.api';

interface IProps {
  title: string;
}

export const ChangeCustomerHistory: FC<IProps> = ({ title }) => {
  const { customerId } = useParams<{ customerId: string }>();
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(8);

  const { data, isLoading } = useGetCustomerChangeHistoryQuery({
    customer_id: customerId || '',
    page,
    page_size: pageSize
  });

  const columns = useMemo(() => getColumns(), []);

  const handlePaginationChange = (nextPage: number, nextPageSize?: number) => {
    setPage(nextPage);
    if (nextPageSize) setPageSize(nextPageSize);
  };

  return (
    <DashboardLayout title={title}>
      <Table<ICustomerChangeHistory>
        pagination={false}
        columns={columns}
        dataSource={(data?.results as ICustomerChangeHistory[]) || []}
        bordered
        loading={isLoading}
        scroll={{ x: 'max-content' }}
      />
      <CustomPagination current={page} pageSize={pageSize} total={data?.count || 0} onChange={handlePaginationChange} />
    </DashboardLayout>
  );
};
