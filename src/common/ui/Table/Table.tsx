import { useTranslation } from 'react-i18next';
import { Table as AntdTable, type TableProps } from 'antd';
import './styles.scss';

export function Table<T extends object>(props: TableProps<T>) {
  const { t } = useTranslation();
  const { locale, ...rest } = props;
  const mergedLocale = {
    emptyText: t('objectDetail.noData'),
    ...locale
  };
  return <AntdTable {...(rest as TableProps<T>)} locale={mergedLocale} />;
}
