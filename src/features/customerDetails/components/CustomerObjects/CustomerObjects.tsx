import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { ContractCard } from './components';
import { ContractDetails } from './components/ContractDetails';
import { IContract } from './types';

export const CustomerObjects = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabDetail = searchParams.get('tab-detail');

  const [selectedContract, setSelectedContract] = useState<IContract | null>(null);

  const contracts: IContract[] = useMemo(
    () => [
      {
        name: 'Авангард канализация',
        contractDate: '12 марта 2025',
        type: 'Новостройка',
        status: 'Активен'
      },
      {
        name: 'Авангард канализация',
        contractDate: '12 марта 2025',
        type: 'Новостройка',
        status: 'Отказано'
      }
    ],
    []
  );

  useEffect(() => {
    if (tabDetail) {
      const contract = contracts.find((c) => c.name === tabDetail);
      if (contract) {
        setSelectedContract(contract);
      } else {
        setSearchParams({}, { replace: true });
      }
    }
  }, [tabDetail, contracts, setSearchParams]);

  const handleDetailsClick = (contract: IContract) => {
    setSelectedContract(contract);
    setSearchParams((prev) => {
      prev.append('tab-detail', contract.name);
      return prev;
    });
  };

  const handleBack = () => {
    setSelectedContract(null);
    setSearchParams((prev) => {
      prev.delete('tab-detail');
      return prev;
    });
  };

  return (
    <div>
      {selectedContract ? (
        <ContractDetails contract={selectedContract} onBack={handleBack} />
      ) : (
        contracts.map((contract, index) => <ContractCard key={index} {...contract} onDetailsClick={() => handleDetailsClick(contract)} />)
      )}
    </div>
  );
};
