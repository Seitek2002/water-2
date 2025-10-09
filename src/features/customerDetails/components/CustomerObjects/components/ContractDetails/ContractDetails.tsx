import { useTranslation } from 'react-i18next';
import { Button, Tag, Typography } from 'antd';
import { IContract } from '../../types';

const { Text, Title } = Typography;
const statusColors: Record<IContract['status'], string> = {
  Активен: 'green',
  Отказано: 'red'
};

interface IContractDetailsProps {
  contract: IContract & {
    address?: string;
    area?: string;
    cost?: string;
    cadastralNumber?: string;
    tvStatus?: string;
    coordinates?: string;
  };
  onBack: () => void;
}

export const ContractDetails: React.FC<IContractDetailsProps> = ({ contract, onBack }) => {
  const { t } = useTranslation();
  const details = [
    { label: t('customers.details.contract.contractDate'), value: contract.contractDate || t('tuDetails.notSpecified') },
    { label: t('objectForm.labels.type'), value: contract.type || t('tuDetails.notSpecified') },
    { label: t('applicationDetails.labels.address'), value: contract.address || t('tuDetails.notSpecified') },
    { label: t('objectForm.labels.cadastralNumber'), value: contract.cadastralNumber || t('tuDetails.notSpecified') },
    { label: t('customers.details.contract.tuStatus'), value: contract.tvStatus || t('tuDetails.notSpecified') },
    { label: t('common.coordinates'), value: contract.coordinates || t('tuDetails.notSpecified') },
    { label: t('common.area'), value: contract.area || t('tuDetails.notSpecified') },
    { label: t('common.status'), value: <Tag color={statusColors[contract.status]}>{contract.status}</Tag> },
    { label: t('customers.details.contract.cost'), value: contract.cost || t('tuDetails.notSpecified') }
  ];

  const leftColumnSize = 7;
  const leftColumn = details.slice(0, leftColumnSize);
  const rightColumn = details.slice(leftColumnSize);

  return (
    <>
      <Title level={4}>{contract.name}</Title>
      <div className='box-wrapper'>
        <div>
          <Button onClick={onBack}>{t('common.back')}</Button>
        </div>
        <div style={{ display: 'flex', gap: '32px', marginTop: 16 }}>
          <div style={{ flex: 1 }}>
            {leftColumn.map((item, index) => (
              <div key={index} style={{ marginBottom: 8 }}>
                <Title level={5}>{item.label}: </Title>
                <Text>{item.value}</Text>
              </div>
            ))}
          </div>
          <div style={{ flex: 1 }}>
            {rightColumn.map((item, index) => (
              <div key={index} style={{ marginBottom: 8 }}>
                <Title level={5}>{item.label}: </Title>
                <Text>{item.value}</Text>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
