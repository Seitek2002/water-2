import { FC, useMemo } from 'react';
import { Table } from 'common/ui';
import { data } from '../../ApplicationsTab.helpers';
import { ApplicationData } from '../../types';
import { getColumns } from './Applications.helpers';

interface IApplicationProps {
  selectApplication: (record: ApplicationData) => void;
}

export const Applications: FC<IApplicationProps> = ({ selectApplication }) => {
  const columns = useMemo(() => {
    return getColumns({
      onClick: (record, action) => {
        switch (action) {
          case 'decorate':
            console.log('Delete action clicked for record:', record);
            break;
          case 'customerDetails':
            selectApplication(record);
            break;
        }
      }
    });
  }, [selectApplication]);

  return <Table columns={columns} dataSource={data} pagination={false} scroll={{ x: 'max-content' }} />;
};
