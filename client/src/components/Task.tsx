import React, { MouseEvent } from 'react';
import {
  IonItem,
  IonButton,
  IonLabel,
  IonNote,
  IonBadge,
  IonIcon,
  IonCheckbox,
  IonButtons
} from '@ionic/react';
import { create, trash } from 'ionicons/icons';
import { ITask } from '../declarations';

interface ITaskProps {
  task: ITask,
  deleteTask: Function
};

export const Task: React.FC<ITaskProps> = ({ task, deleteTask }) => {
 
  const onDeleteClick = (event: MouseEvent) => {
    event.preventDefault();
    deleteTask(task);
  };

  const isChecked = (task: ITask) => {
    if (task.status === 'COMPLETE') {
      return true;
    }
    return false;
  }

  return (
    <IonItem>
      <IonCheckbox checked={isChecked(task)} slot="start" className='ion-margin-end ion-align-items-start' />
      <IonLabel>
        <h2>{ task.title }</h2>
        <IonNote item-start>
          { task.description }
        </IonNote>
        <br />
        <IonNote>
          <IonBadge color='primary'>
            Server version: { task.version }
          </IonBadge>
        </IonNote>
      </IonLabel>
      <IonButtons>
        <IonButton item-start  color='primary' fill="outline" href={`updateTask/${task.id}`}>
          <IonIcon icon={create}/>
        </IonButton>
        <IonButton onClick={onDeleteClick} item-start className='trash-button' color='primary' fill="outline">
          <IonIcon icon={trash}/>
        </IonButton>
      </IonButtons>
    </IonItem>
  );

};
