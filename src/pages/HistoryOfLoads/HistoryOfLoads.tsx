import { FC, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { Col, Input, Row, Table, Typography } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { DashboardLayout } from 'components/DashboardLayout';

import { useGetCustomerByIdQuery } from 'api/Customer.api';
import { useGetLoadIncreasesQuery } from 'api/Ty.api';
import { t } from 'i18next';

interface IProps {
  title: string;
}

type RowItem = {
  key: string;
  tuNumber: string;
  load: string;
  regDate: string;
  comment?: string;
  created_by?: number | string;
  created_by_name?: string;
};

const CollaboratorCell: FC<{ createdBy?: number | string; createdByName?: string }> = ({ createdBy, createdByName }) => {
  const shouldSkip = !!createdByName || !createdBy;
  const { data } = useGetCustomerByIdQuery(createdBy as number | string, { skip: shouldSkip });
  const name = createdByName || data?.full_name || '-';
  return <>{name}</>;
};

export const HistoryOfLoads: FC<IProps> = ({ title }) => {
  const { id } = useParams<{ id: string }>();
  const [searchText, setSearchText] = useState('');

  const { data, isLoading } = useGetLoadIncreasesQuery(
    { tyId: id || '' },
    {
      skip: !id
    }
  );

  const rows = useMemo<RowItem[]>(() => {
    return (
      data?.map((item) => {
        const water = item.changes?.water_required?.new;
        const pressure = item.changes?.pressure_required?.new;
        const sewage = item.changes?.sewage_amount?.new;

        const parts: string[] = [];
        if (water !== undefined && water !== null && water !== '') {
          parts.push(`${water} ${t('tuDetails.units.m3PerDay') || 'м³/сут'}`);
        }
        if (pressure !== undefined && pressure !== null && pressure !== '') {
          parts.push(`${pressure} ${t('tuDetails.units.mWaterCol') || 'м вод. ст.'}`);
        }
        if (sewage !== undefined && sewage !== null && sewage !== '') {
          parts.push(`${sewage} ${t('tuDetails.units.m3PerDay') || 'м³/сут'}`);
        }

        return {
          key: String(item.id),
          tuNumber: String(item.technical_condition_id || id || ''),
          created_by: item.created_by,
          created_by_name: item.created_by_name,
          load: parts.join(' | '),
          regDate: item.created_at ? dayjs(item.created_at).format('DD.MM.YYYY') : '',
          comment: item.comment || ''
        };
      }) || []
    );
  }, [data, id]);

  const filteredRows = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.tuNumber.toLowerCase().includes(q) ||
        (r.created_by_name || '').toLowerCase().includes(q) ||
        r.load.toLowerCase().includes(q) ||
        (r.comment || '').toLowerCase().includes(q)
    );
  }, [rows, searchText]);

  const columns = [
    {
      title: t('historyOfLoads.columns.tu'),
      dataIndex: 'tuNumber'
    },
    {
      title: t('historyOfLoads.columns.collaborator'),
      dataIndex: 'created_by_name',
      render: (_: unknown, record: RowItem) => <CollaboratorCell createdBy={record.created_by} createdByName={record.created_by_name} />
    },
    {
      title: t('historyOfLoads.columns.loadAdded'),
      dataIndex: 'load'
    },
    {
      title: t('historyOfLoads.columns.regDate'),
      dataIndex: 'regDate'
    },
    {
      title: t('common.comment'),
      dataIndex: 'comment'
    }
  ];

  return (
    <DashboardLayout title={title}>
      <Row justify='space-between' style={{ marginBottom: 16 }}>
        <Col span={12}>
          <Input
            placeholder={t('filterBar.search')}
            prefix={<SearchOutlined />}
            style={{ marginBottom: 16 }}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />
        </Col>
        <Col>
          <Typography.Text type='secondary'>
            {t('historyOfLoads.hint.ty')}: {id}
          </Typography.Text>
        </Col>
      </Row>

      <Table columns={columns} dataSource={filteredRows} pagination={false} loading={isLoading} />
    </DashboardLayout>
  );
};
