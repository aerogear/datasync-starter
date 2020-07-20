import React from 'react';
import {
  HashRouter as AppRouter,
  Switch,
  Redirect,
  Route,
} from 'react-router-dom';
import { IonApp } from '@ionic/react';
import { TaskPage, AddTaskPage, OfflineQueuePage, UpdateTaskPage, ProfilePage } from '../pages';
import { ViewTaskPage } from '../pages/ViewTaskPage';

export const Router: React.FC = () => {
  return (
    <IonApp>
      <AppRouter>
        <Switch>
          <Route
            path="/addTask"
            component={AddTaskPage}
            exact
          />
          <Route path="/viewTask/:id" component={ViewTaskPage} exact />
          <Route path="/updateTask/:id" component={UpdateTaskPage} exact />
          <Route path="/offlineQueue" component={OfflineQueuePage} exact={true} />
          <Route path="/tasks" component={TaskPage} exact={true} />
          <Route path="/profile" component={ProfilePage} exact={true} />
          <Route exact path="/" render={() => <Redirect to="tasks" />} />
        </Switch>
      </AppRouter>
    </IonApp>
  );
}