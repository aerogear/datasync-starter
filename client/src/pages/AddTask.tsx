import React, { useState, SyntheticEvent } from 'react'
import { RouteComponentProps } from 'react-router-dom'
import {
  IonButtons,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonItem,
  IonLabel,
  IonInput,
  IonBackButton,
} from '@ionic/react';
import { useOfflineMutation } from 'react-offix-hooks';
import { ADD_TASK } from '../gql/queries';
import { mutationOptions } from '../helpers';

const AddTask: React.FC<RouteComponentProps> = ({ history }) => {

  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  const [addTask] = useOfflineMutation(ADD_TASK, mutationOptions.add);

  const submit = (event: SyntheticEvent) => {
    event.preventDefault();
    addTask({
      variables: {
        title,
        description,
        status: 'OPEN',
        version: 1
      },
    });
    history.push('/tasks');
  };

  // function renderMutationInfo() {
  //   return (
  //     <IonCard>
  //       <p>
  //         {JSON.stringify({
  //           called,
  //           data,
  //           error,
  //           hasError,
  //           loading,
  //           mutationVariables,
  //           calledWhileOffline,
  //           offlineChangeReplicated,
  //           offlineReplicationError
  //         }, null, 2)}
  //       </p>
  //     </IonCard>
  //   )
  // }
  
  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/" />
          </IonButtons>
          <IonTitle>New Task</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
      {/* {renderMutationInfo()} */}
        <form onSubmit={submit} style={{ padding: '0 16px' }}>
          <IonItem>
            <IonLabel color="primary" position="floating">Title</IonLabel>
            <IonInput 
              type="text" 
              required 
              name="title" 
              value={title} 
              onInput={(e:any) => setTitle(e.target.value)} 
            />
          </IonItem>
          <IonItem>
            <IonLabel color="primary" position="floating">Description</IonLabel>
            <IonInput 
              type="text" 
              required 
              name="description" 
              value={description} 
              onInput={(e:any) => setDescription(e.target.value)}
            />
          </IonItem>
          <IonButton className="submit-btn" expand="block" type="submit">Create</IonButton>
        </form>
      </IonContent>
    </>
  )
}

export default AddTask;
