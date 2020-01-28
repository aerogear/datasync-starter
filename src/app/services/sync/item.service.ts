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
  ApolloOfflineStore,
  getOperationFieldName
} from 'offix-client-boost';
import { subscriptionOptions } from './cache.updates';
import gql from 'graphql-tag';
import { DocumentNode, OperationDefinitionNode } from 'graphql';
import { OperationVariables } from 'apollo-client'

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
    return this.buildSyncQuery({
      query: GET_TASKS
    })
  }

  // This will also be a helper in offix
  buildSyncQuery({ query, variables }: { query: DocumentNode, variables?: OperationVariables }) {
    let cacheOnly = 'cache-only'
    let cacheAndNetwork = 'cache-and-network'
    let initialFetchPolicy = cacheAndNetwork

    const operationName = this.getOperationName(query)

    try {
      const cachedResult = this.apollo.readQuery({
        query,
        variables
      })
  
      if (cachedResult && cachedResult[operationName] && cachedResult[operationName].lastSync) {
        initialFetchPolicy = cacheOnly 
      }
    } catch(e) {
      console.log(`no results in cache for ${operationName}`)
    }

    const syncQuery = this.apollo.watchQuery({
      query: query,
      variables,
      fetchPolicy: initialFetchPolicy as any,
      errorPolicy: 'none'
    });

    return syncQuery
  }

  // This should be a helper in offix
  getOperationName (query: DocumentNode) {
    const definition = query.definitions.find(def => def.kind === "OperationDefinition");
    const operationDefinition = definition && definition as OperationDefinitionNode;
    return operationDefinition && operationDefinition.name && operationDefinition.name.value;
  };

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
      update: (cache, { data }) => {
        if (data) {
          try {
            const queryResult = cache.readQuery({ query: GET_TASKS }) as any;
            //@ts-ignore
            const deletedId = data.deleteTask

            if (queryResult.allTasks && queryResult.allTasks.items) {

              const filteredItems = queryResult.allTasks.items.filter((item: any) => {
                return item.id !== deletedId;
              });

              queryResult.allTasks.items = filteredItems;
              cache.writeQuery({
                query: GET_TASKS,
                data: queryResult
              });

            }
            } finally {}
          }
        }
      });
  }

  getOfflineItems() {
    return this.offlineStore.getOfflineData();
  }

  getClient() {
    return this.apollo;
  }
}
