import React from 'react';
import { Task } from './Task';
import { IonList, IonGrid, IonRow, IonCol, IonText } from '@ionic/react';
import { useOfflineMutation } from 'react-offix-hooks';
import { DELETE_TASK, UPDATE_TASK } from '../gql/queries';
import { mutationOptions } from '../helpers';
import { ITask } from '../declarations';

const TaskList: React.FC<any> = ({ tasks }) => {

  const [updateTask] = useOfflineMutation(UPDATE_TASK, mutationOptions.edit);
  const [deleteTask] = useOfflineMutation(DELETE_TASK, mutationOptions.remove);
  
  const handleDelete = (task: ITask) => {
    deleteTask({ variables: task });
  };

  const handleUpdate = (task: ITask) => {
    updateTask({variables: task});
  }
  
  if(tasks.length < 1) return (
    <IonGrid className="queue-empty ion-justify-content-center">
      <IonRow className="ion-justify-content-center">
        <IonCol>
          <IonText color="medium">
            <p>You currently have no tasks.</p>
          </IonText>
        </IonCol>
      </IonRow>
    </IonGrid>
  );

  return (
    <IonList>
      {
        tasks.map((task : ITask) => {
          return <Task key={task.id} task={task} updateTask={handleUpdate} deleteTask={handleDelete} />;
        })
      }
    </IonList>
  );

};

export default TaskList;
