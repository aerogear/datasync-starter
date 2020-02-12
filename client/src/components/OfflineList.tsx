import React from 'react';
import { IonItem, IonLabel, IonItemGroup, IonBadge, IonGrid, IonRow, IonCol, IonText, IonList } from '@ionic/react';

export const OfflineList = ({ offlineStore }: { offlineStore: any }) => {

  if (!offlineStore) return <h2>Loading...</h2>; 

  if (offlineStore.length === 0) return (
    <IonGrid className="queue-empty ion-justify-content-center">
      <IonRow className="ion-justify-content-center">
        <IonCol>
          <IonText color="medium">
            <p>You currently have no changes<br /> staged offline.</p>
          </IonText>
        </IonCol>
      </IonRow>
    </IonGrid>
  );

  return <IonList>
    { 
      offlineStore.map(({ operation }: any, index: any) => {
        const { context, variables } = operation.op;
        const keys = Object.keys(variables);
        return (
          <IonItemGroup key={index}>
            <IonItem>
              <IonLabel>
                <h2>
                  Mutation type:
                  <IonBadge color="primary">
                    {context.operationName}
                  </IonBadge>
                </h2>
                <ul>
                  {keys.map((key, i) => <li key={i}>{variables[key]}</li>)}
                </ul>
              </IonLabel>
            </IonItem>
          </IonItemGroup>
        );
      })
    }
  </IonList>;


}