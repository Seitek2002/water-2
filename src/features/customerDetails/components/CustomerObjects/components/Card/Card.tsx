import React from 'react';
import { Card, Flex, Tag, Typography } from 'antd';
import { IContract, StatusCode } from '../../types';
import './styles.scss';

const { Text, Link } = Typography;

const statusColors: Record<StatusCode, string> = {
  Активен: 'green',
  Отказано: 'red'
};

interface IProps extends IContract {
  onDetailsClick: () => void;
}

export const ContractCard: React.FC<IProps> = ({ name, contractDate, type, status, onDetailsClick }) => {
  return (
    <Card variant='borderless'>
      <div className='contract-card'>
        <div>
          <Text strong style={{ fontSize: 16 }}>
            {name}
          </Text>
          <Flex gap='4px'>
            <Text type='secondary'>Договор: </Text>
            <Text>{contractDate}</Text>
          </Flex>
          <Flex gap='4px'>
            <Text type='secondary'>Тип: </Text>
            <Text>{type}</Text>
          </Flex>
          <Flex gap='4px'>
            <Text type='secondary'>Статус: </Text>
            <Tag color={statusColors[status]}>{status}</Tag>
          </Flex>
        </div>
        <div onClick={onDetailsClick}>
          <Link underline>Подробнее</Link>
        </div>
      </div>
    </Card>
  );
};
