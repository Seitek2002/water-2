import { FC, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Table } from 'common/ui';
import CustomPagination from 'common/ui/Pagination/CustomPagination';
import { DashboardLayout } from 'components/DashboardLayout';
import { getColumns } from './ChangeApplicationHistory.helpers';

import { useGetApplicationHistoryQuery } from 'api/Application.api';

interface IProps {
  title: string;
}

export const ChangeApplicationHistory: FC<IProps> = ({ title }) => {
  const { id } = useParams<{ id: string }>();
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(8);

  const { data, isLoading } = useGetApplicationHistoryQuery({ application_id: id || '', page, page_size: pageSize });

  const { t } = useTranslation();
  const columns = useMemo(() => getColumns(t), [t]);

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
