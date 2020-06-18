import React, { useState } from 'react'
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
import { mutationOptions } from '../helpers';
import { getTask, findTasks, updateTask } from '../graphql/generated';
import { TaskForm } from '../forms/TaskForm';

export interface IUpdateMatchParams {
  id: string
}

export const UpdateTaskPage: React.FC<RouteComponentProps<IUpdateMatchParams>> = ({ history, match }) => {

  const { id } = match.params;
  const [showToast, setShowToast] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const { loading, error, data } = useQuery(getTask, {
    variables: { id },
    fetchPolicy: 'cache-only',
  });

  const [updateTaskMutation] = useOfflineMutation(
    updateTask, {
      update: (store, { data: op }) => {
        const data = store.readQuery({ query: findTasks });
        const items = [
          // @ts-ignore
          ...data.findTasks.items,
          // @ts-ignore
          op.updateTask,
        ];
        // @ts-ignore
        data.findTasks.items = items;
        store.writeQuery({ query: findTasks, data});
      }
    },
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
