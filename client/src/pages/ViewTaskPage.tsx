import React, { useContext, useState, useEffect } from 'react'
import { RouteComponentProps } from 'react-router-dom'
import { IonContent, IonLoading, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonList, IonItemGroup, IonItem, IonLabel, IonAvatar, IonToast } from '@ionic/react';
import { Header } from '../components/Header';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { Empty } from '../components';
import { createComment, getTask, findTasks } from '../graphql/generated';
import { commentViewSchema, taskViewSchema } from '../forms/task';
import { AutoForm, TextField } from "uniforms-ionic";
import { AuthContext } from '../AuthContext';
import { subscriptionOptions } from '../helpers';
import { useNetworkStatus } from 'react-offix-hooks';

export interface ViewMatchParams {
  id: string
}

export const ViewTaskPage: React.FC<RouteComponentProps<ViewMatchParams>> = ({ history, match }) => {
  const [showToast, setShowToast] = useState<boolean>(false);
  const offline = !useNetworkStatus()
  const { id } = match.params;
  const [mounted, setMounted] = useState<boolean>(false);
  const { profile } = useContext(AuthContext);
  const [createCommentMutation] = useMutation(
    createComment, { refetchQueries: [{ query: findTasks }] }
  );
  const userName = profile?.username || "Anonymous User";

  const submit = (model: any) => {
    if (offline) {
      setShowToast(offline)
    } else {
      createCommentMutation({
        variables: { input: { ...model, noteId: id } }
      }).then((comment) => {
        console.log("comment created")
      }).catch((error) => {
        console.log(error)
      })
    }

  }

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

  if (error) return <pre>{JSON.stringify(error)}</pre>;

  if (loading) return <IonLoading
    isOpen={loading}
    message={'Loading...'}
  />;

  if (data && data.getTask) {
    const task = data.getTask;
    const Text = TextField as any;
    return (
      <>
        <Header title="Task" backHref="/tasks" match={match} />
        <IonContent>
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Current Task</IonCardTitle>
            </IonCardHeader>
            <AutoForm schema={taskViewSchema} model={task} >
              <Text name="title" readonly />
              <Text name="description" readonly />
            </AutoForm>
          </IonCard>
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Create comment</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <AutoForm schema={commentViewSchema} onSubmit={submit} model={{ author: userName }} disabled={offline} />
            </IonCardContent>
            <IonCardHeader>
              <IonCardTitle>Comments</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonList>
                <IonItemGroup>
                  {
                    task.comments && task.comments.map((comment: any, key: number) => {
                      return (
                        <IonItem key={key} style={{ padding: '1em 0' }}>
                          <IonAvatar slot="start">
                            <img src="assets/icon/avatar.svg" alt="" />
                          </IonAvatar>
                          <IonLabel>
                            <h3>{comment.author}</h3>
                            <p>{comment.message}</p>
                          </IonLabel>
                        </IonItem>
                      );
                    })
                  }
                </IonItemGroup>
              </IonList>
            </IonCardContent>
          </IonCard>
          <IonToast
            isOpen={showToast}
            onDidDismiss={() => setShowToast(false)}
            message="Cannot add comment when offline"
            position="bottom"
            color="danger"
            duration={4000}
          />
        </IonContent>
      </>
    )
  }
  return (
    <>
      <Header title="task" backHref="/tasks" match={match} />
      <Empty message={<p>No task found</p>} />
    </>
  );
}
