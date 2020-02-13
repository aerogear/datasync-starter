import React, { useEffect, useState } from 'react';
import { useQuery } from '@apollo/react-hooks';
import { useNetworkStatus } from 'react-offix-hooks';
import { add } from 'ionicons/icons';
import { 
  IonHeader, 
  IonPage, 
  IonTitle, 
  IonToolbar, 
  IonSegment, 
  IonSegmentButton, 
  IonLabel, 
  IonButtons, 
  IonIcon, 
  IonButton, 
  IonMenuButton, 
  IonFooter, 
  IonBadge,
  IonLoading 
} from '@ionic/react';
import TaskList from '../components/TaskList';
import { GET_TASKS } from '../gql/queries';
import { subscriptionOptions,  } from '../helpers';
import { useSubscribeToMore, useOfflineQueueListener } from '../hooks';
import { ITask } from '../declarations';
import { Empty } from '../components/Empty';

const Task: React.FC = () => {

  const isOnline = useNetworkStatus();
  const offlineQueue = useOfflineQueueListener();
  const [tasks, setTasks] = useState<[ITask]>(null!);
  const { loading, error, data, subscribeToMore } = useQuery(GET_TASKS);
  useSubscribeToMore({ options: subscriptionOptions, subscribeToMore});

  useEffect(() => {
    if (data) {
      setTasks(data.allTasks);
    };
  }, [data]);

  const networkStateUI = (isOnline) 
    ?<IonBadge class="network-badge" color="secondary">Online</IonBadge>
    :<IonBadge class="network-badge" color="primary">Offline</IonBadge>;

  if (error) return <pre>{ JSON.stringify(error) }</pre>;

  if (loading) return <IonLoading
    isOpen={loading}
    message={'Loading...'}
  />;

  if (tasks) return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton></IonMenuButton>
          </IonButtons>
          <IonTitle>Manage Tasks</IonTitle>
          <IonButtons slot="end">
            <IonButton>
              <IonButton href="/addTask">
                <IonIcon slot="icon-only" icon={add} />
              </IonButton>
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonToolbar>
        <IonSegment>
          <IonSegmentButton value="all">
            <IonLabel>All Tasks</IonLabel>
          </IonSegmentButton>
          {/* <IonSegmentButton value="open">
            <IonLabel>Open</IonLabel>
          </IonSegmentButton> */}
        </IonSegment>
      </IonToolbar>
      <TaskList tasks={tasks} />
      <IonFooter>
        <div>
          <IonLabel>
            <IonButton size="small" color="primary" fill="outline" href="/offlineQueue" className="offline-queue-button">
              Offline changes
            </IonButton>
            <IonBadge color="primary" class="offline-queue-badge">
              { offlineQueue }
            </IonBadge>
          </IonLabel>
          { networkStateUI }
        </div>
      </IonFooter>
    </IonPage>
  );

  return <Empty message={<p>No tasks available</p>} />
  
};

export default Task;