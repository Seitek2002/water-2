import { FC } from 'react';
import { Tag, Typography } from 'antd';
import { ApplicationData } from '../../types';

interface IProps {
  application: ApplicationData;
}
const { Title, Text } = Typography;

const statusObj = {
  approved: 'Одобрено',
  rejected: 'Отказано'
};

export const ApplicationDetail: FC<IProps> = ({ application }) => {
  return (
    <>
      <div className='box-wrapper'>
        <Title level={5}>Наименование объекта:</Title>
        <Text>{application.objectName}</Text>
      </div>
      <div className='box-wrapper'>
        <Title level={5}>Дата регистрации</Title>
        <Text>{application.date}</Text>

        <Title level={5}>Заказчик</Title>
        <Text>{application.customer}</Text>

        <Title level={5}>Адрес</Title>
        <Text>{application.address}</Text>

        <Title level={5}>Количество водопроводной воды</Title>
        <Text>{application.waterAmount}</Text>

        <Title level={5}>Количество стоков</Title>
        <Text>{application.wastewaterAmount}</Text>

        <Title level={5}>Статус</Title>
        <Tag color={application.status === 'approved' ? 'green' : 'red'}>{statusObj[application.status]}</Tag>

        {application.status === 'rejected' && (
          <>
            <Title level={5}>Причина отказа</Title>
            <Text>{application.rejectReason}</Text>

            <Title level={5}>Комментарий</Title>
            <Text>{application.comment}</Text>
          </>
        )}
      </div>
    </>
  );
};
