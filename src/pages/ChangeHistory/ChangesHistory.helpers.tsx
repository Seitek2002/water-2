import { Tag } from 'antd';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { IHistoryType } from 'types/common';
import { IHistory } from 'types/entities';

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

const translateValue = (val: string): string => {
  const key = (val || '').toString().trim().toLowerCase();
  switch (key) {
    // Application statuses
    case 'pending':
      return i18next.t('applications.statusTag.pending');
    case 'approved':
      return i18next.t('applications.statusTag.approved');
    case 'rejected':
      return i18next.t('applications.statusTag.rejected');
    case 'contracted':
      return i18next.t('applications.statusTag.contracted');
    // TU statuses
    case 'active':
      return i18next.t('tuDetails.status.active');
    case 'inactive':
      return i18next.t('tuDetails.status.inactive');
    case 'archived':
      return i18next.t('tuDetails.status.archived');
    // TU stages
    case 'draft':
      return i18next.t('tuDetails.stage.draft');
    // Common stage synonyms that might appear in English
    case 'review':
    case 'in review':
      return i18next.t('tuDetails.stage.review');
    case 'done':
    case 'completed':
    case 'complete':
      return i18next.t('tuDetails.stage.done');
    default:
      return val;
  }
};

export const getColumns = (): ColumnsType<IHistory> => [
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
  },
  {
    title: i18next.t('changeHistory.columns.field'),
    dataIndex: 'changes',
    key: 'changes_field',
    render: (changes: { field: string; new: string; old: string }[]) => {
      return changes ? changes?.map((c, i) => <div key={i}>{c.field}</div>) : i18next.t('common.noData');
    }
  },
  {
    title: i18next.t('changeHistory.columns.oldValue'),
    dataIndex: 'changes',
    key: 'changes_old',
    render: (changes: { field: string; new: string; old: string }[]) => (
      <>{changes?.map((c, i) => <div key={i}>{translateValue(c.old) || i18next.t('common.noData')}</div>)}</>
    )
  },
  {
    title: i18next.t('changeHistory.columns.newValue'),
    dataIndex: 'changes',
    key: 'changes_new',
    render: (changes: { field: string; new: string; old: string }[]) => (
      <>{changes?.map((c, i) => <div key={i}>{translateValue(c.new) || i18next.t('common.noData')}</div>)}</>
    )
  }
];
