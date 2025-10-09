import { useCallback, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Button, Card, Col, DatePicker, Flex, Input, Row, Select, Space, type TableProps, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { Dayjs } from 'dayjs';
import { Pagination as CommonPagination, Table } from 'common/ui';
import { DashboardLayout } from 'components/DashboardLayout';
import type { IAccountingInvoice, IGetInvoicesListParams } from 'types/entities/accounting';

import { useGetInvoicesListQuery, useLazyGetProtocolByIdQuery } from 'api/Accounting.api';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

type SearchState = {
  customer_id?: string;
  entity_id?: string;
  protocol_id?: string;
  invoice_number?: string;
  invoice_type?: string;
  is_paid?: string; // 'true' | 'false' | ''
  search?: string;
  ordering?: string;
  page?: string;
  page_size?: string;
  invoice_date_start?: string;
  invoice_date_end?: string;
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

export default function InvoicesPage({ title = 'routers.invoices' }: { title?: string }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [sp, setSp] = useSearchParams();
  const [fetchProtocol] = useLazyGetProtocolByIdQuery();

  // Read search params
  const searchState = useMemo<SearchState>(() => {
    const obj = Object.fromEntries(sp.entries()) as Partial<SearchState>;
    return obj as SearchState;
  }, [sp]);
  const page = Number(searchState.page || 1);
  const pageSize = Number(searchState.page_size || 10);

  const params: IGetInvoicesListParams = useMemo(() => {
    return {
      customer_id: toNumber(searchState.customer_id),
      entity_id: toNumber(searchState.entity_id),
      protocol_id: toNumber(searchState.protocol_id),
      invoice_number: searchState.invoice_number || undefined,
      invoice_type: searchState.invoice_type || undefined,
      is_paid: parseBoolStr(searchState.is_paid),
      search: searchState.search || undefined,
      ordering: searchState.ordering || undefined,
      page,
      page_size: pageSize,
      invoice_date_start: searchState.invoice_date_start || undefined,
      invoice_date_end: searchState.invoice_date_end || undefined
    };
  }, [searchState, page, pageSize]);

  const query = useGetInvoicesListQuery(params);

  const setParams = useCallback(
    (patch: Partial<SearchState>) => {
      const next = new URLSearchParams(sp);
      Object.entries(patch).forEach(([k, v]) => {
        if (v === undefined || v === null || v === '') next.delete(k);
        else next.set(k, String(v));
      });
      // reset page on filter change (unless explicitly set)
      if (!('page' in patch)) next.set('page', '1');
      setSp(next, { replace: true });
    },
    [sp, setSp]
  );

  const handleDateChange = (_dates: [Dayjs | null, Dayjs | null] | null, dateStrings: [string, string]) => {
    const [start, end] = dateStrings;
    if (!start || !end) {
      setParams({ invoice_date_start: '', invoice_date_end: '' });
      return;
    }
    setParams({
      invoice_date_start: start,
      invoice_date_end: end
    });
  };

  const handleTableChange: TableProps<IAccountingInvoice>['onChange'] = (_pagination, _filters, sorter) => {
    const s = Array.isArray(sorter) ? sorter[0] : sorter;
    // Antd sorter: { field, order: 'ascend'|'descend'|undefined, columnKey }
    if (s && s.field) {
      const f = String(s.field);
      const ord = s.order === 'descend' ? `-${f}` : f;
      setParams({ ordering: s.order ? ord : '' });
    }
  };

  const goToTuAccounting = async (protocolId: number) => {
    try {
      const res = await fetchProtocol({ protocolId: String(protocolId) }).unwrap();
      const tuId = res?.technical_condition;
      if (tuId) {
        navigate(`/dashboard/technical-conditions/tu-details/${tuId}?tab=accounting`);
      }
    } catch {
      // fallback: do nothing
      // optionally show message
    }
  };

  const columns: ColumnsType<IAccountingInvoice> = [
    {
      title: t('changeHistory.columns.id'),
      dataIndex: 'id',
      key: 'id',
      sorter: true,
      render: (v: number, record) => (
        <Button type='link' onClick={() => goToTuAccounting(record.protocol)}>
          {v}
        </Button>
      ),
      width: 90
    },
    {
      title: t('protocolDetail.invoice.number'),
      dataIndex: 'invoice_number',
      key: 'invoice_number'
    },
    {
      title: t('common.dateLabel'),
      dataIndex: 'invoice_date',
      key: 'invoice_date',
      sorter: true,
      render: (v: string) => (v ? new Date(v).toLocaleDateString('ru-RU') : '')
    },
    {
      title: t('accounting.labels.type'),
      dataIndex: 'invoice_type',
      key: 'invoice_type',
      render: (v: string) => {
        let color: 'blue' | 'orange' | 'default' = 'default';
        let label = v;
        if (v === 'main') {
          color = 'blue';
          label = t('accounting.invoiceTypeLabels.main');
        } else if (v === 'paper_tu') {
          color = 'orange';
          label = t('accounting.invoiceTypeLabels.paper_tu');
        }
        return <Tag color={color}>{label}</Tag>;
      }
    },
    {
      title: t('accounting.labels.total'),
      dataIndex: 'total_sum',
      key: 'total_sum',
      align: 'right'
    },
    {
      title: t('accounting.labels.status'),
      dataIndex: 'is_paid',
      key: 'is_paid',
      render: (v: boolean) =>
        v ? <Tag color='green'>{t('accounting.messages.paidTag')}</Tag> : <Tag color='blue'>{t('accounting.labels.pending')}</Tag>
    }
  ];

  const onPageChange = (p: number, ps?: number) => {
    setParams({ page: String(p), page_size: ps ? String(ps) : String(pageSize) });
  };

  const dataSource = query.data?.results || [];
  const total = query.data?.count || 0;

  // Controls
  const [searchInput, setSearchInput] = useState(searchState.search || '');

  return (
    <DashboardLayout title={title.includes('.') ? title : t('routers.invoices')}>
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
              placeholder={t('accounting.labels.invoiceNumber')}
              value={searchState.invoice_number || ''}
              onChange={(e) => setParams({ invoice_number: e.target.value })}
              allowClear
            />
            <Input
              style={{ width: 140 }}
              placeholder={t('exportData.filters.customer_id')}
              value={searchState.customer_id || ''}
              onChange={(e) => setParams({ customer_id: e.target.value })}
              allowClear
            />
            <Input
              style={{ width: 120 }}
              placeholder={t('exportData.filters.entity_id')}
              value={searchState.entity_id || ''}
              onChange={(e) => setParams({ entity_id: e.target.value })}
              allowClear
            />
            <Input
              style={{ width: 140 }}
              placeholder={t('exportData.filters.protocol_id')}
              value={searchState.protocol_id || ''}
              onChange={(e) => setParams({ protocol_id: e.target.value })}
              allowClear
            />
            <Select
              placeholder={t('accounting.labels.type')}
              style={{ width: 160 }}
              allowClear
              value={searchState.invoice_type || undefined}
              onChange={(v) => setParams({ invoice_type: v || '' })}
              options={[
                { value: 'main', label: t('accounting.invoiceTypeLabels.main') },
                { value: 'paper_tu', label: t('accounting.invoiceTypeLabels.paper_tu') }
              ]}
            />
            <Select
              placeholder={t('accounting.labels.status')}
              style={{ width: 140 }}
              allowClear
              value={searchState.is_paid || undefined}
              onChange={(v) => setParams({ is_paid: v || '' })}
              options={[
                { value: 'true', label: t('accounting.messages.paidTag') },
                { value: 'false', label: t('accounting.labels.pending') }
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
                { value: 'created_at', label: t('filterBar.newOldFirst') },
                { value: '-invoice_date', label: t('common.dateLabel') + ' ↓' },
                { value: 'invoice_date', label: t('common.dateLabel') + ' ↑' }
              ]}
            />
            <RangePicker onChange={handleDateChange} placeholder={[t('common.dateStart'), t('common.dateEnd')]} />

            <Button type='primary' onClick={() => setParams({ search: searchInput })}>
              {t('filterBar.searchButton')}
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
                {`${t('protocolDetail.invoice.title')} (${total})`}
              </Title>
            </Col>
          </Row>

          <Table<IAccountingInvoice>
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
              <Text type='danger'>{t('accounting.errors.invoicesLoadDesc')}</Text>
            </div>
          )}
        </Card>
      </Space>
    </DashboardLayout>
  );
}
