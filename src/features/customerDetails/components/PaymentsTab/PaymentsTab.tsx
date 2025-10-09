import React, { useMemo } from 'react';
import { Table } from 'common/ui';
import { data, getColumns } from './PaymentsTab.helpers';

export const PaymentsTab: React.FC = () => {
  const columns = useMemo(() => {
    return getColumns({
      onClick: (record, action) => {
        switch (action) {
          case 'payment':
            console.log('Payment action clicked for record:', record);
        }
      }
    });
  }, []);

  return <Table columns={columns} dataSource={data} pagination={false} />;
};
