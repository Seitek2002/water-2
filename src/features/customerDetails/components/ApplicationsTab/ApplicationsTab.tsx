import { useCallback, useState } from 'react';
import { ApplicationDetail } from './components/ApplicationDetail';
import { Applications } from './components/Applications/Applications';
import { ApplicationData } from './types';

export const ApplicationsTab = () => {
  const [selectedApplication, setSelectedApplication] = useState<ApplicationData | null>(null);

  const handleDetailsClick = useCallback((application: ApplicationData) => {
    console.log('handleDetailsClick with:', application.id);
    setSelectedApplication(application);
  }, []);

  return (
    <div>
      {selectedApplication ? (
        <ApplicationDetail application={selectedApplication} />
      ) : (
        <Applications selectApplication={handleDetailsClick} />
      )}
    </div>
  );
};
