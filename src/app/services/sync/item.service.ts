import { Injectable } from '@angular/core';
import {
  ADD_TASK,
  DELETE_TASK,
  GET_TASKS,
  UPDATE_TASK
} from './graphql.queries';
import { AllTasks, Task } from './types';
import { VoyagerService } from './voyager.service';
import {
  ApolloOfflineClient,
  CacheOperation,
  subscribeToMoreHelper,
  ApolloOfflineStore
} from 'offix-client-boost';
import { subscriptionOptions } from './cache.updates';
import gql from 'graphql-tag';

@Injectable({
  providedIn: 'root'
})
export class ItemService {

  private readonly apollo: ApolloOfflineClient;
  private offlineStore: ApolloOfflineStore;

  constructor(aeroGear: VoyagerService) {
    this.apollo = aeroGear.apolloClient;
    this.offlineStore = aeroGear.offlineStore;
  }

  // Watch local cache for updates
  getItems() {
    // TODO
    // We should be able determine if there is a lastSync value at startup
    // and provide it here. We can possibly get that from the cache without any special storage
    const getTasks = this.apollo.watchQuery({
      query: GET_TASKS,
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'none'
    });
    // subscribeToMoreHelper(getTasks, subscriptionOptions);
    return getTasks;
  }

  createItem(title, description) {
    return this.apollo.offlineMutate<Task>({
      mutation: ADD_TASK,
      variables: {
        'title': title,
        'description': description,
        'version': 1,
        'status': 'OPEN'
      },
      updateQuery: GET_TASKS,
      returnType: 'Task'
    });
  }

  updateItem(item) {
    return this.apollo.offlineMutate<Task>({
      mutation: UPDATE_TASK,
      variables: item,
      updateQuery: GET_TASKS,
      returnType: 'Task',
      operationType: CacheOperation.REFRESH
    }
    );
  }

  deleteItem(item) {
    return this.apollo.offlineMutate<Task>({
      mutation: DELETE_TASK,
      variables: item,
      updateQuery: GET_TASKS,
      returnType: 'Task',
      operationType: CacheOperation.DELETE
    }
    );
  }

  getOfflineItems() {
    return this.offlineStore.getOfflineData();
  }

  getClient() {
    return this.apollo;
  }
}
