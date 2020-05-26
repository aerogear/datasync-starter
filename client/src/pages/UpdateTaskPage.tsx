import React, { useState } from 'react'
import { RouteComponentProps } from 'react-router-dom'
import {
  IonContent,
  IonCard,
  IonLabel,
  IonCardHeader,
  IonCardContent,
  IonNote,
  IonBadge,
  IonLoading,
  IonToast,
} from '@ionic/react';
import { useOfflineMutation } from 'react-offix-hooks';
import { useQuery } from '@apollo/react-hooks';
import { Header } from '../components/Header';
import { Empty } from '../components/Empty';
import { mutationOptions } from '../helpers';
import { IUpdateMatchParams } from '../declarations';
import { updateTask } from '../graphql/mutations/updateTask';
import { findTasks } from '../graphql/queries/findTasks';
import { TaskForm } from '../forms/TaskForm';

export const UpdateTaskPage: React.FC<RouteComponentProps<IUpdateMatchParams>> = ({ history, match }) => {

  const { id } = match.params;
  const [ showToast, setShowToast ] = useState<boolean>(false);
  const [ errorMessage, setErrorMessage ] = useState<string>('');
  const { loading, error, data } = useQuery(findTasks, { 
    variables: { fields: { id } },
    fetchPolicy: 'cache-only',
  });

  const [updateTaskMutation ] = useOfflineMutation(
    updateTask, mutationOptions.updateTask,
  );

  const handleError = (error: any) => {
    if (error.offline) {
      error.watchOfflineChange();
      history.push('/');
      return;
    }
    console.log(error);
    setErrorMessage(error.message);
    setShowToast(true);
  }

  const submit = (model: any) => {
    // remove `__typename` property without
    // deleting from the model object (as this may be a state reference)
    const { __typename, ...no__typename } = model;
    updateTaskMutation({
      variables: { input: no__typename }
    })
      .then(() => history.push('/'))
      .catch(handleError);
  }

  if (error) return <pre>{JSON.stringify(error)}</pre>;

  if (loading) return <IonLoading
    isOpen={loading}
    message={'Loading...'}
  />;

  if (data && data.findTasks) {
    const task = data.findTasks;
    return (
      <>
        <Header title="Update task" backHref="/tasks" match={match} />
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
          <TaskForm handleSubmit={submit} model={task} />
          <IonToast
            isOpen={showToast}
            onDidDismiss={() => setShowToast(false)}
            message={errorMessage}
            position="top"
            color="danger"
            duration={2000}
          />
        </IonContent>
      </>
    )
  };

  return (
    <>
      <Header title="Update task" backHref="/tasks" match={match} />
      <Empty message={<p>No task found</p>} />
    </>
  );

}
