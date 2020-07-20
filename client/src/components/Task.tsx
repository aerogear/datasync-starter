import React, { MouseEvent, SyntheticEvent } from 'react';
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
import { create, trash, navigate } from 'ionicons/icons';
import { ITask } from '../declarations';
import { Link, useHistory } from 'react-router-dom';

export const Task: React.FC<any> = ({ task, updateTask, deleteTask }) => {
  const history = useHistory();
  const onDeleteClick = (event: MouseEvent) => {
    event.preventDefault();
    deleteTask(task);
  };

  const onViewClick = (event: MouseEvent) => {
    event.preventDefault();
    history.push(`/viewTask/${task.id}`);
  };

  const check = (event: SyntheticEvent) => {
    event.preventDefault();
    let status = (task.status === 'COMPLETE') ? 'OPEN' : 'COMPLETE';
    updateTask({
      ...task,
      status
    });
  }

  const isChecked = (task: ITask) => {
    if (task.status === 'COMPLETE') {
      return true;
    }
    return false;
  }

  return (
    <IonItem>
      <IonCheckbox checked={isChecked(task)} onClick={check} slot="start" className='ion-margin-end ion-align-items-start' />
      <IonLabel>
        <h2>{task.title}</h2>
        <IonNote item-start>
          {task.description}
        </IonNote>
        <br />
        <IonNote>
          <IonBadge color='primary'>
            Server timestamp: {new Date(Number.parseInt(task.updatedAt)).toUTCString()}
          </IonBadge>
        </IonNote>
      </IonLabel>
      <IonButtons>
        <IonButton onClick={onViewClick} item-start className='view-button' color='primary' fill="outline">
          <IonIcon icon={navigate} />
        </IonButton>
        <Link to={`updateTask/${task.id}`}>
          <IonButton item-start color='primary' fill="outline">
            <IonIcon icon={create} />
          </IonButton>
        </Link>
        <IonButton onClick={onDeleteClick} item-start className='trash-button' color='primary' fill="outline">
          <IonIcon icon={trash} />
        </IonButton>



      </IonButtons>
    </IonItem>
  );

};
