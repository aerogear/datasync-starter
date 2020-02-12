import React from 'react';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
} from '@ionic/react';
import { OfflineList } from '../components/OfflineList';
import { useGetOfflineStore } from '../helpers/useGetOfflineStore';

const OfflineQueue: React.FC = () => {

  const offlineStore = useGetOfflineStore();

  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/tasks" />
          </IonButtons>
          <IonTitle>Offline Queue</IonTitle>

        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <OfflineList offlineStore={offlineStore} />
      </IonContent>
    </>
  );
};

export default OfflineQueue;