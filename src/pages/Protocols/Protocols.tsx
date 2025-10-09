import { useCallback, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Button, Card, Col, DatePicker, Flex, Input, Row, Select, Space, type TableProps, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { Dayjs } from 'dayjs';
import { Pagination as CommonPagination, Table } from 'common/ui';
import { DashboardLayout } from 'components/DashboardLayout';
import type { IAccountingProtocol, IGetAccountingProtocolsListParams } from 'types/entities/accounting';

import { useGetAllProtocolsQuery } from 'api/Accounting.api';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

type SearchState = {
  search?: string;
  ordering?: string;
  page?: string;
  page_size?: string;

  created_start?: string;
  created_end?: string;

  customer_id?: string;
  entity_id?: string;
  has_invoice?: string; // 'true' | 'false'
  request_number?: string;
  technical_condition_id?: string;
};

function parseBoolStr(v?: string): boolean | undefined {
  if (v === 'true') return true;
  if (v === 'false') return false;
  return undefined;
}

function toNumber(v?: string): number | undefined {
  if (!v) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

export default function ProtocolsPage({ title = 'routers.protocols' }: { title?: string }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [sp, setSp] = useSearchParams();

  const searchState = useMemo<SearchState>(() => {
    const obj = Object.fromEntries(sp.entries()) as Partial<SearchState>;
    return obj as SearchState;
  }, [sp]);

  const page = Number(searchState.page || 1);
  const pageSize = Number(searchState.page_size || 10);

  const params: IGetAccountingProtocolsListParams = useMemo(() => {
    return {
      page,
      page_size: pageSize,
      ordering: searchState.ordering || undefined,
      search: searchState.search || undefined,

      created_start: searchState.created_start || undefined,
      created_end: searchState.created_end || undefined,

      customer_id: toNumber(searchState.customer_id),
      entity_id: toNumber(searchState.entity_id),
      has_invoice: parseBoolStr(searchState.has_invoice),
      request_number: searchState.request_number || undefined,
      technical_condition_id: toNumber(searchState.technical_condition_id)
    };
  }, [searchState, page, pageSize]);

  const query = useGetAllProtocolsQuery(params);

  const setParams = useCallback(
    (patch: Partial<SearchState>) => {
      const next = new URLSearchParams(sp);
      Object.entries(patch).forEach(([k, v]) => {
        if (v === undefined || v === null || v === '') next.delete(k);
        else next.set(k, String(v));
      });
      if (!('page' in patch)) next.set('page', '1');
      setSp(next, { replace: true });
    },
    [sp, setSp]
  );

  const handleDateChange = (_dates: [Dayjs | null, Dayjs | null] | null, dateStrings: [string, string]) => {
    const [start, end] = dateStrings;
    if (!start || !end) {
      setParams({ created_start: '', created_end: '' });
      return;
    }
    setParams({
      created_start: start,
      created_end: end
    });
  };

  const handleTableChange: TableProps<IAccountingProtocol>['onChange'] = (_pagination, _filters, sorter) => {
    const s = Array.isArray(sorter) ? sorter[0] : sorter;
    if (s && s.field) {
      const f = String(s.field);
      const ord = s.order === 'descend' ? `-${f}` : f;
      setParams({ ordering: s.order ? ord : '' });
    }
  };

  const goToTuDetails = (technicalConditionId: number) => {
    navigate(`/dashboard/technical-conditions/tu-details/${technicalConditionId}?tab=accounting`);
  };

  const columns: ColumnsType<IAccountingProtocol> = [
    {
      title: t('changeHistory.columns.id'),
      dataIndex: 'id',
      key: 'id',
      sorter: true,
      width: 90
    },
    {
      title: t('common.dateLabel'),
      dataIndex: 'created_at',
      key: 'created_at',
      sorter: true,
      render: (v: string) => (v ? new Date(v).toLocaleString('ru-RU') : '')
    },
    {
      title: t('routers.tuNumberPrefix'),
      dataIndex: 'technical_condition',
      key: 'technical_condition',
      render: (v: number) => (
        <Button type='link' onClick={() => goToTuDetails(v)}>
          {v}
        </Button>
      )
    },
    {
      title: t('protocolDoc.tuWater'),
      dataIndex: 'water_sum',
      key: 'water_sum',
      align: 'right'
    },
    {
      title: t('protocolDoc.tuSewer'),
      dataIndex: 'kanal_sum',
      key: 'kanal_sum',
      align: 'right'
    },
    {
      title: t('common.totalLabel'),
      key: 'total',
      align: 'right',
      render: (_: unknown, record) => {
        const total = Number(record.total_sum_main || 0) + Number(record.total_sum_paper || 0);
        return total ? total.toLocaleString('ru-RU') : '';
      }
    }
  ];

  const onPageChange = (p: number, ps?: number) => {
    setParams({ page: String(p), page_size: ps ? String(ps) : String(pageSize) });
  };

  const dataSource = query.data?.results || [];
  const total = query.data?.count || 0;

  const [searchInput, setSearchInput] = useState(searchState.search || '');

  return (
    <DashboardLayout title={title.includes('.') ? title : t('routers.protocols')}>
      <Space direction='vertical' style={{ width: '100%' }} size={16}>
        <Card>
          <Flex wrap='wrap' gap={12} align='center'>
            <Input
              style={{ width: 200 }}
              placeholder={t('filterBar.search')}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onPressEnter={() => setParams({ search: searchInput })}
              allowClear
            />
            <Input
              style={{ width: 160 }}
              placeholder={t('tuDetails.labels.requestNumber')}
              value={searchState.request_number || ''}
              onChange={(e) => setParams({ request_number: e.target.value })}
              allowClear
            />
            <Input
              style={{ width: 160 }}
              placeholder={t('exportData.filters.technical_condition_id')}
              value={searchState.technical_condition_id || ''}
              onChange={(e) => setParams({ technical_condition_id: e.target.value })}
              allowClear
            />
            <Select
              placeholder={t('technicalConditions.filter.hasInvoice')}
              style={{ width: 140 }}
              allowClear
              value={searchState.has_invoice || undefined}
              onChange={(v) => setParams({ has_invoice: v || '' })}
              options={[
                { value: 'true', label: t('technicalConditions.filter.hasInvoice') },
                { value: 'false', label: t('common.noData') }
              ]}
            />
            <Select
              placeholder={t('filterBar.byDate')}
              style={{ width: 160 }}
              allowClear
              value={searchState.ordering || undefined}
              onChange={(v) => setParams({ ordering: v || '' })}
              options={[
                { value: '-created_at', label: t('filterBar.newOnesfirst') },
                { value: 'created_at', label: t('filterBar.newOldFirst') }
              ]}
            />
            <RangePicker showTime onChange={handleDateChange} placeholder={[t('common.dateStart'), t('common.dateEnd')]} />

            <Button type='primary' onClick={() => setParams({ search: searchInput })}>
              {t('filterBar.search')}
            </Button>
            <Button
              onClick={() => {
                setSp(new URLSearchParams(), { replace: true });
              }}
            >
              {t('common.reset')}
            </Button>
          </Flex>
        </Card>

        <Card>
          <Row justify='space-between' align='middle' style={{ marginBottom: 12 }}>
            <Col>
              <Title level={4} style={{ margin: 0 }}>
                {t('routers.protocols')} ({total})
              </Title>
            </Col>
          </Row>

          <Table<IAccountingProtocol>
            loading={query.isLoading}
            dataSource={dataSource}
            columns={columns}
            rowKey='id'
            pagination={false}
            onChange={handleTableChange}
          />

          <CommonPagination
            current={page}
            pageSize={pageSize}
            total={total}
            onChange={onPageChange}
            showSizeChanger
            onShowSizeChange={(p, ps) => onPageChange(p, ps)}
          />

          {query.isError && (
            <div style={{ marginTop: 12 }}>
              <Text type='danger'>{t('accounting.errors.loadDesc')}</Text>
            </div>
          )}
        </Card>
      </Space>
    </DashboardLayout>
  );
}
