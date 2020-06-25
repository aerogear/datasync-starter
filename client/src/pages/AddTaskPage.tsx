import React, { useState } from 'react'
import { RouteComponentProps } from 'react-router-dom'
import { IonContent, IonToast, IonCard } from '@ionic/react';
import { useOfflineMutation } from 'react-offix-hooks';
import { Header } from '../components/Header';
import { createTask, findTasks } from '../graphql/generated';
import { TaskForm } from '../forms/TaskForm';
import { mutationOptions } from '../helpers';

type PaginatedTasks = {
  findTasks: {
    items: [any]
  }
}

export const AddTaskPage: React.FC<RouteComponentProps> = ({ history, match }) => {

  const [showToast, setShowToast] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const [createTaskMutation] = useOfflineMutation(createTask, mutationOptions.createTask);

  const handleError = (error: any) => {
    if (error.offline) {
      error.watchOfflineChange();
      history.push('/');
      return;
    }
    setErrorMessage(error.message);
    setShowToast(true);
  };

  const submit = (model: any) => {
    createTaskMutation({
      variables: { input: { ...model } }
    })
      .then(() => history.push('/'))
      .catch(handleError);
  };

  return (
    <>
      <Header title="Add task" backHref="/tasks" match={match} />
      <IonContent>
        <IonCard>
          <TaskForm handleSubmit={submit} model={{}} />
        </IonCard>
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
}
