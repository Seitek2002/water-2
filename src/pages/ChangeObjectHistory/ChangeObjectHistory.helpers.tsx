import type { TableColumnsType } from 'antd';
import { Tag } from 'antd';
import dayjs from 'dayjs';
import { IHistoryType } from 'types/common';
import { IObjectChangeHistory } from 'types/entities';

import type { TFunction } from 'i18next';

const renderStatus = (text: IHistoryType, t: TFunction) => {
  if (text === '+') {
    return <Tag color='success'>{t('changeHistory.status.created')}</Tag>;
  }
  if (text === '-') {
    return <Tag color='error'>{t('changeHistory.status.deleted')}</Tag>;
  }
  if (text === '~') {
    return <Tag color='processing'>{t('changeHistory.status.updated')}</Tag>;
  }
  return null;
};

export const getColumns = (t: TFunction): TableColumnsType<IObjectChangeHistory> => [
  {
    title: t('changeHistory.columns.id'),
    dataIndex: 'history_id',
    key: 'history_id',
    align: 'center'
  },
  {
    title: t('changeHistory.columns.user'),
    dataIndex: 'history_user',
    key: 'history_user',
    align: 'center'
  },
  {
    title: t('changeHistory.columns.date'),
    dataIndex: 'history_date',
    key: 'history_date',
    align: 'center',
    render: (text: string) => dayjs(text).format('DD-MM-YYYY-HH:mm')
  },
  {
    title: t('changeHistory.columns.type'),
    dataIndex: 'history_type',
    key: 'history_type',
    align: 'center',
    render: (text: IHistoryType) => renderStatus(text, t)
  }
];
