import { Injectable } from '@angular/core';
import {
  ADD_TASK,
  DELETE_TASK,
  GET_TASKS,
  TASK_CREATED_SUBSCRIPTION,
  TASK_DELETED_SUBSCRIPTION,
  TASK_MODIFIED_SUBSCRIPTION,
  UPDATE_TASK
} from './graphql.queries';
import { AllTasks, Task } from './types';
import { VoyagerService } from './voyager.service';
import { VoyagerClient, createOptimisticResponse } from '@aerogear/datasync-js';
import { UpdateService } from './update.service';

@Injectable({
  providedIn: 'root'
})
export class ItemService {

  private readonly apollo: VoyagerClient;

  constructor(aeroGear: VoyagerService) {
    this.apollo = aeroGear.apolloClient;
  }

  /**
   * Force cache refresh to get recent data
   */
  refreshItems() {
    // Force cache refresh by performing network
    this.apollo.query<AllTasks>({
      query: GET_TASKS,
      fetchPolicy: 'network-only',
      errorPolicy: 'none'
    });
  }

  // Watch local cache for updates
  getItems() {
    return this.apollo.watchQuery<AllTasks>({
      query: GET_TASKS,
      fetchPolicy: 'cache-first',
      errorPolicy: 'none'
    });
  }

  createItem(title, description) {
    const item = {
      'title': title,
      'description': description,
    };
    return this.apollo.mutate<Task>({
      mutation: ADD_TASK,
      variables: item,
      optimisticResponse:
        createOptimisticResponse('createTask', 'Task', item),
      update: UpdateService.updateCacheOnAdd
    });
  }

  updateItem(item) {
    return this.apollo.mutate<Task>({
      mutation: UPDATE_TASK,
      variables: item,
      optimisticResponse:
        createOptimisticResponse('updateTask', 'Task', item, false),
      update: UpdateService.updateCacheOnEdit
    });
  }

  deleteItem(item) {
    return this.apollo.mutate<Task>({
      mutation: DELETE_TASK,
      variables: { id: item.id },
      optimisticResponse:
        createOptimisticResponse('deleteTask', 'Task', { id: item.id }, false),
      update: UpdateService.updateCacheOnDelete
    });
  }

  subscribeToUpdate() {
    return this.apollo.subscribe<any>({
      query: TASK_MODIFIED_SUBSCRIPTION
    });
  }

  subscribeToDelete() {
    return this.apollo.subscribe({
      query: TASK_DELETED_SUBSCRIPTION
    });
  }

  subscribeToNew() {
    return this.apollo.subscribe<any>({
      query: TASK_CREATED_SUBSCRIPTION
    });
  }
}
