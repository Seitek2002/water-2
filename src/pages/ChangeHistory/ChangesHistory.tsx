import { FC, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { Table } from 'antd';
import CustomPagination from 'common/ui/Pagination/CustomPagination';
import { DashboardLayout } from 'components/DashboardLayout';
import { getColumns } from './ChangesHistory.helpers';

import { useGetHistoryTyQuery } from 'api/Ty.api';

interface IProps {
  title: string;
}

export const ChangesHistory: FC<IProps> = ({ title }) => {
  const { tyId } = useParams<{ tyId: string }>();
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(8);

  const { data, isLoading } = useGetHistoryTyQuery({ tyId: tyId || '', page_size: pageSize, page });

  const columns = useMemo(() => getColumns(), []);

  const handlePaginationChange = (nextPage: number, nextPageSize?: number) => {
    setPage(nextPage);
    if (nextPageSize) setPageSize(nextPageSize);
  };

  return (
    <DashboardLayout title={title}>
      <Table
        pagination={false}
        columns={columns}
        dataSource={data?.results || []}
        bordered
        loading={isLoading}
        scroll={{ x: 'max-content' }}
      />
      <CustomPagination current={page} pageSize={pageSize} total={data?.count || 0} onChange={handlePaginationChange} />
    </DashboardLayout>
  );
};
