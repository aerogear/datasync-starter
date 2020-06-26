import React, { useState, useEffect } from 'react'
import { RouteComponentProps } from 'react-router-dom'
import {
  IonContent,
  IonLoading,
  IonToast,
  IonCard,
} from '@ionic/react';
import { useOfflineMutation } from 'react-offix-hooks';
import { useQuery } from '@apollo/react-hooks';
import { Header } from '../components/Header';
import { Empty } from '../components/Empty';
import { getTask, updateTask } from '../graphql/generated';
import { TaskForm } from '../forms/TaskForm';
import { subscriptionOptions, mutationOptions } from '../helpers';

export interface IUpdateMatchParams {
  id: string
}

export const UpdateTaskPage: React.FC<RouteComponentProps<IUpdateMatchParams>> = ({ history, match }) => {

  const { id } = match.params;
  const [mounted, setMounted] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const { loading, error, data, subscribeToMore } = useQuery(getTask, {
    variables: { id },
    fetchPolicy: 'cache-only',
  });

  useEffect(() => {
    if (mounted) {
      subscribeToMore(subscriptionOptions.addComment)
    }
    setMounted(true);
    return () => setMounted(false);
  }, [mounted, setMounted, subscribeToMore]);

  const [updateTaskMutation] = useOfflineMutation(
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
    const { __typename, comments, createdAt, updatedAt, ...input } = model;
    updateTaskMutation({
      variables: { input: {...input, version: model.version + 1} }
    })
      .then(() => history.push('/'))
      .catch(handleError);
  }

  if (error) return <pre>{JSON.stringify(error)}</pre>;

  if (loading) return <IonLoading
    isOpen={loading}
    message={'Loading...'}
  />;

  if (data && data.getTask) {
    const task = data.getTask;
    return (
      <>
        <Header title="Update task" backHref="/tasks" match={match} />
        <IonContent>
          <IonCard>
            <TaskForm handleSubmit={submit} model={task} />
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
  };

  return (
    <>
      <Header title="Update task" backHref="/tasks" match={match} />
      <Empty message={<p>No task found</p>} />
    </>
  );

}
