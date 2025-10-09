import { Button, Space, Tag, Typography } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { ITechnicalCondition } from 'types/entities/tu';

import i18next from 'i18next';

type actionType = 'edit' | 'delete' | 'view';

type IGetColumnsFn = (options: { onClick: (record: ITechnicalCondition, action: actionType) => void }) => ColumnsType<ITechnicalCondition>;

const { t } = i18next;

export const getColumns: IGetColumnsFn = ({ onClick }) => {
  return [
    {
      title: t('historyOfLoads.columns.tu'),
      dataIndex: 'id',
      key: 'id',
      render: (text, record) => (
        <Typography.Link onClick={() => onClick(record, 'view')} strong>
          {text}
        </Typography.Link>
      ),
      onCell: (record) => ({ style: { cursor: 'pointer' }, onClick: () => onClick(record, 'view') }),
      width: 90
    },
    {
      title: t('objectCard.createdAt'),
      dataIndex: 'created_at',
      key: 'created_at',
      width: 150,
      render: (date) => dayjs(date).format('DD-MM-YYYY-HH:mm')
    },
    { title: t('customers.columns.customer'), dataIndex: ['customer', 'full_name'], key: 'customer', width: 170 },
    { title: t('applicationDetails.labels.address'), dataIndex: 'address', key: 'address', width: 170 },
    { title: t('applicationDetails.labels.objectName'), dataIndex: 'object_name', key: 'objectName', width: 260 },
    { title: t('applicationDetails.labels.waterRequired'), dataIndex: 'water_required', key: 'water_required', width: 135 },
    {
      title: t('applicationDetails.labels.wastewater'),
      dataIndex: 'sewage_amount',
      key: 'sewage_amount',
      width: 135
    },
    {
      title: t('protocolDetail.invoice.title'),
      dataIndex: 'payment_paper',
      key: 'payment_paper',
      width: 160,
      render: (_, record) => {
        return (
          <>
            <Typography.Text strong>№{record.payment_paper?.number}</Typography.Text>
            <br />
            <Typography.Text type='secondary'>
              {t('protocolDetail.payment.columns.date')}: {dayjs(record.payment_paper?.date).format('DD.MM.YYYY')}
            </Typography.Text>
          </>
        );
      }
    },
    { title: t('tuDetails.labels.paymentInvoiceNumber'), dataIndex: 'request_number', key: 'payment_invoice_number', width: 160 },
    { title: t('tuDetails.labels.paymentAmount'), dataIndex: 'payment_amount', key: 'payment_amount', width: 145 },
    { title: t('protocolDetail.paid'), dataIndex: 'paid_amount', key: 'paid_amount', width: 145 },
    { title: t('protocolDetail.payment.columns.date'), dataIndex: 'payment_date', key: 'payment_date', width: 145 },
    {
      title: t('common.remaining'),
      dataIndex: 'remaining_amount',
      key: 'remaining_amount',
      width: 145,
      render: (text) => (text < 0 ? 0 : text)
    },
    {
      title: t('common.status'),
      dataIndex: 'status',
      key: 'status',
      render: (_, record: ITechnicalCondition) => {
        if (record.status === 'active') {
          return <Tag color='green'>{t('filterBar.approved')}</Tag>;
        }
        if (record.status === 'inactive') {
          return <Tag color='red'>{t('filterBar.rejected')}</Tag>;
        }
        return <Tag color='default'>{t('filterBar.archived')}</Tag>;
      },
      width: 145
    },
    {
      title: t('exportDataHistory.columns.actions'),
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => onClick(record, 'edit')} disabled={record.status === 'inactive'} />
          <Button icon={<DeleteOutlined />} onClick={() => onClick(record, 'delete')} danger />
        </Space>
      ),
      width: 145
    }
  ];
};
