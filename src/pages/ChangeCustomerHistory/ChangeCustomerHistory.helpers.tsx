import { Tag } from 'antd';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { IHistoryType } from 'types/common';
import { ICustomerChangeHistory } from 'types/entities';

import i18next from 'i18next';

const renderStatus = (text: IHistoryType) => {
  if (text === '+') {
    return <Tag color='success'>{i18next.t('changeHistory.status.created')}</Tag>;
  }
  if (text === '-') {
    return <Tag color='error'>{i18next.t('changeHistory.status.deleted')}</Tag>;
  }
  if (text === '~') {
    return <Tag color='processing'>{i18next.t('changeHistory.status.updated')}</Tag>;
  }
};

export const getColumns = (): ColumnsType<ICustomerChangeHistory> => [
  {
    title: i18next.t('changeHistory.columns.id'),
    dataIndex: 'history_id',
    key: 'history_id',
    align: 'center'
  },
  {
    title: i18next.t('changeHistory.columns.user'),
    dataIndex: 'history_user',
    key: 'history_user',
    align: 'center'
  },
  {
    title: i18next.t('changeHistory.columns.date'),
    dataIndex: 'history_date',
    key: 'history_date',
    align: 'center',
    render: (text: string) => dayjs(text).format('DD-MM-YYYY-HH:mm')
  },
  {
    title: i18next.t('changeHistory.columns.type'),
    dataIndex: 'history_type',
    key: 'history_type',
    align: 'center',
    render: (text: IHistoryType) => renderStatus(text)
  }
];
