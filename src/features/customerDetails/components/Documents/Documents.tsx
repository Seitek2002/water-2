import { useMemo } from 'react';
import { Table } from 'common/ui';
import { data, getColumns } from './Documents.helpers';
import './styles.scss';

export const Documents = () => {
  const handleDelete = (key: string) => {
    console.log('Delete document with key:', key);
  };

  const handleDownload = (name: string) => {
    console.log('Download document:', name);
  };

  const columns = useMemo(() => {
    return getColumns({
      onClick: (record, action) => {
        switch (action) {
          case 'delete':
            handleDelete(record.key);
            break;
          case 'download':
            handleDownload(record.name);
            break;
        }
      }
    });
  }, []);

  return <Table columns={columns} dataSource={data} pagination={false} className='documents-table' />;
};
