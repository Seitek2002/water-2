import { Tag, Typography } from 'antd';
import './styles.scss';

const { Text, Title } = Typography;

export const CustomerDetailsData = () => {
  return (
    <div className='customer-details-data'>
      <div className='box-wrapper'>
        <Title level={4}>ОсОО "Сайрус"</Title>
        <Text>Юридическое лицо </Text>
      </div>
      <div className='box-wrapper'>
        <Title level={4}>Дата регистрации</Title>
        <Text>14-03-2025</Text>

        <Title level={4}>Паспортные данные</Title>
        <Text>AN 8829921</Text>

        <Title level={4}>Адрес</Title>
        <Text>г.Бишкек ул.Токтогула 122</Text>

        <Title level={4}>Контакты</Title>
        <Text>г.Бишкек ул.Токтогула 122</Text>

        <Title level={4}>Статус</Title>
        <Tag color='green'>Одобрено</Tag>
      </div>
    </div>
  );
};
