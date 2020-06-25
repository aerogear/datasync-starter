import React, { useEffect, useState } from 'react';
import { useQuery } from '@apollo/react-hooks';
import { add } from 'ionicons/icons';
import { 
  IonPage, 
  IonSegment, 
  IonSegmentButton, 
  IonLabel, 
  IonIcon, 
  IonFooter,
  IonLoading,
  IonFab,
  IonFabButton,
  IonContent,
} from '@ionic/react';
import { subscriptionOptions,  } from '../helpers';
import { Empty, TaskList, NetworkBadge, OfflineQueueBadge, Header } from '../components';
import { RouteComponentProps } from 'react-router';
import { findTasks } from '../graphql/generated';
import { Link } from 'react-router-dom';
import { useNetworkStatus } from 'react-offix-hooks';

export const TaskPage: React.FC<RouteComponentProps> = ({match}) => {

  const [subscribed, setSubscribed] = useState<boolean>(false);
  const { loading, error, data, subscribeToMore } = useQuery(findTasks, {
    fetchPolicy: 'cache-and-network'
  });
  
  const isOnline = useNetworkStatus();

  useEffect(() => {
    if (!subscribed) {
      subscribeToMore(subscriptionOptions.add);
      subscribeToMore(subscriptionOptions.edit);
      subscribeToMore(subscriptionOptions.remove);
      setSubscribed(true);
    }
  }, [subscribed, setSubscribed, subscribeToMore])

  if (error && !error.networkError) {
    return <pre>{ JSON.stringify(error) }</pre>
  };

  if (loading) return <IonLoading
    isOpen={loading}
    message={'Loading...'}
  />;

  const content = (data && data.findTasks && data.findTasks.items) 
    ? <TaskList tasks={data.findTasks.items} />
    : <Empty message={<p>No tasks available</p>} />;

  return (
    <IonPage>
      <Header title="Manage Tasks"  match={match} isOnline={isOnline} />
      <IonContent className="ion-padding" >
        <IonSegment>
          <IonSegmentButton value="all">
            <IonLabel>All Tasks</IonLabel>
          </IonSegmentButton>
        </IonSegment>
        { content }
        <IonFab vertical="bottom" horizontal="end" slot="fixed" style={{ 'marginBottom': '2em', 'marginRight': '1em' }}>
          <Link to="/addTask">
            <IonFabButton>
              <IonIcon icon={add} />
            </IonFabButton>
          </Link>
        </IonFab>
      </IonContent>
      <IonFooter>
        <div>
          <OfflineQueueBadge isOnline={isOnline} />
          <NetworkBadge isOnline={isOnline} />
        </div>
      </IonFooter>
    </IonPage>
  );
  
};
