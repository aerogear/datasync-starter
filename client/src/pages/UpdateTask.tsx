import React, { useEffect, useState, SyntheticEvent } from 'react'
import { RouteComponentProps } from 'react-router-dom'
import {
  IonContent,
  IonCard,
  IonButton,
  IonItem,
  IonLabel,
  IonInput,
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
import { Header } from '../components/Header';
import { Empty } from '../components/Empty';

const UpdateTask: React.FC<RouteComponentProps> = ({ history, match }) => {

  // @ts-ignore
  const { id } = match.params;
  
  const [task, setTask] = useState<ITask>(null!);
  const [title, setTitle] = useState<string>(null!);
  const [description, setDescription] = useState<string>(null!);
  const { loading, error, data } = useQuery(GET_TASK, { 
    variables: { id },
    fetchPolicy: 'cache-only',
  });
  const [updateTask] = useOfflineMutation(UPDATE_TASK, mutationOptions.edit);

  useEffect(() => {
    if (data) {
      setTask(data.getTask);
      setTitle(data.getTask.title);
      setDescription(data.getTask.description);
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

  if (error) return <pre>{JSON.stringify(error)}</pre>;

  if (loading) return <IonLoading
    isOpen={loading}
    message={'Loading...'}
  />;

  if (task) return (
    <>
      <Header title="Update task" backHref="/tasks" />
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

  return (
    <>
      <Header title="Update task" backHref="/tasks" />
      <Empty message={<p>No task found</p>} />
    </>
  );

}

export default UpdateTask;
