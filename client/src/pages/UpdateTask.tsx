import React, { useEffect, useState, SyntheticEvent } from 'react'
import { RouteComponentProps } from 'react-router-dom'
import {
  IonButtons,
  IonContent,
  IonHeader,
  IonCard,
  IonTitle,
  IonToolbar,
  IonButton,
  IonItem,
  IonLabel,
  IonInput,
  IonBackButton,
  IonCardHeader,
  IonCardContent,
  IonNote,
  IonBadge,
  IonLoading,
} from '@ionic/react';
import { useOfflineMutation } from 'react-offix-hooks';
import { useQuery } from '@apollo/react-hooks';
import { UPDATE_TASK, GET_TASK } from '../gql/queries';
import { ITask } from '../declarations';
import { mutationOptions } from '../helpers';

// @ts-ignore
const UpdateTask: React.FC<RouteComponentProps> = ({ history, match }) => {

  // @ts-ignore
  const { id } = match.params;
  
  const [task, setTask] = useState<ITask>(null!);
  const [title, setTitle] = useState<string>(null!);
  const [loading, setLoading] = useState<boolean>(true);
  const [description, setDescription] = useState<string>(null!);
  const { error, data } = useQuery(GET_TASK, { 
    variables: { id },
    fetchPolicy: 'cache-first',
  });
  const [updateTask] = useOfflineMutation(UPDATE_TASK, mutationOptions.edit);

  useEffect(() => {
    if (data) {
      setTask(data.getTask);
      setTitle(data.getTask.title);
      setDescription(data.getTask.description);
      setLoading(false);
    };
  }, [data]);

  const submit = (event: SyntheticEvent) => {
    event.preventDefault();
    updateTask({
      variables: {
        ...task,
        title,
        description,
      },
    });
    history.push('/tasks');
  }

  if (task) return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/" />
          </IonButtons>
          <IonTitle>Update Task</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonCard>
          <IonCardHeader>Task</IonCardHeader>
          <IonCardContent>
            <IonLabel>
              <h2>Title: {task.title}</h2>
              <IonNote>
                Description: {task.description}
              </IonNote>
              <br />
              <IonNote>
                <IonBadge color="primary">
                  Version: {task.version}
                </IonBadge>
              </IonNote>
            </IonLabel>
          </IonCardContent>
        </IonCard>
        <form onSubmit={submit} style={{ padding: '0 16px' }}>
          <IonItem>
            <IonLabel color="primary" position="floating">Title</IonLabel>
            <IonInput type="text" name="title" onInput={(e: any) => setTitle(e.target.value)} value={title} />
          </IonItem>
          <IonItem>
            <IonLabel color="primary" position="floating">Description</IonLabel>
            <IonInput type="text" name="description" onInput={(e: any) => setDescription(e.target.value)} value={description} />
          </IonItem>
          <IonButton className="submit-btn" expand="block" type="submit">Update</IonButton>
        </form>
      </IonContent>
    </>
  );

  if (error) return <pre>{JSON.stringify(error)}</pre>;

  return <IonLoading
    isOpen={loading}
    message={'Loading...'}
  />;

}

export default UpdateTask;
