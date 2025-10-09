import { Button, Tag, Typography } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { ApplicationData, StatusCode } from '../../types';

type actionType = 'decorate' | 'customerDetails';

type IGetColumnsFn = (options: { onClick: (record: ApplicationData, action: actionType) => void }) => ColumnsType<ApplicationData>;

export const getColumns: IGetColumnsFn = ({ onClick }) => {
  return [
    { title: '№ заявки', dataIndex: 'id', key: 'id', align: 'center' },
    { title: 'Дата регистрации', dataIndex: 'date', key: 'date', align: 'center' },
    {
      title: 'Заказчик',
      dataIndex: 'customer',
      key: 'customer',
      align: 'center',
      render: (text, record) => <Typography.Link onClick={() => onClick(record, 'customerDetails')}>{text}</Typography.Link>
    },
    { title: 'Адрес', dataIndex: 'address', key: 'address', align: 'center' },
    { title: 'Наименование объекта', dataIndex: 'objectName', key: 'objectName', width: 260 },
    { title: 'Количество водопроводной воды', dataIndex: 'waterAmount', key: 'waterAmount', align: 'center' },
    { title: 'Количество стоков', dataIndex: 'wastewaterAmount', key: 'wastewaterAmount', align: 'center' },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      render: (status: StatusCode) => (
        <Tag color={status === 'approved' ? 'green' : 'red'}>{status === 'approved' ? 'Одобрено' : 'Отказано'}</Tag>
      ),
      align: 'center'
    },
    {
      title: 'Действие',
      key: 'action',
      render: (_, record: ApplicationData) => (
        <div>
          <Button size='large' type='primary' onClick={() => onClick(record, 'decorate')}>
            Оформление ТУ
          </Button>
        </div>
      ),
      align: 'center'
    }
  ];
};
