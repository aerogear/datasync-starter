import React from 'react';
import { OfflineList } from '../components/OfflineList';
import { useGetOfflineStore } from '../hooks';
import { Header } from '../components/Header';

const OfflineQueue: React.FC = () => {
  const offlineStore = useGetOfflineStore();

  return (
    <>
      <Header title="Offline Queue" backHref="/tasks" />
      <OfflineList offlineStore={offlineStore} />
    </>
  );
};

export default OfflineQueue;