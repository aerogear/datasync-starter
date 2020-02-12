import React from 'react';
import { Task } from './Task';
import { IonList, IonGrid, IonRow, IonCol, IonText } from '@ionic/react';
import { useOfflineMutation } from 'react-offix-hooks';
import { DELETE_TASK } from '../gql/queries';
import { mutationOptions } from '../helpers';
import { ITask } from '../declarations';

interface ITaskListProps {
  tasks: [ITask]
}

const TaskList: React.FC<ITaskListProps> = ({ tasks }) => {

  const [deleteTask] = useOfflineMutation(DELETE_TASK, mutationOptions.remove);
  
  const handleDelete = (task: ITask) => {
    deleteTask({ variables: task });
  };

  
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
          return <Task key={task.id} task={task} deleteTask={handleDelete} />;
        })
      }
    </IonList>
  );

};

export default TaskList;
