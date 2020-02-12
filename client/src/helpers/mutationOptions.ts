import { getUpdateFunction, CacheOperation } from 'offix-cache';
import { GET_TASKS } from '../gql/queries';


const options = {
  updateQuery: GET_TASKS,
  returnType: 'Task',
};

export const mutationOptions = {
  add: {
    ...options,
    mutationName: 'createTask',
    operationType: CacheOperation.ADD,
  },
  
  edit: {
    ...options,
    mutationName: 'updateTask',
    operationType: CacheOperation.REFRESH,
  },
  
  remove: {
    ...options,
    mutationName: 'deleteTask',
    operationType: CacheOperation.DELETE,
  },
};

export const taskCacheUpdates = {
  createTask: getUpdateFunction(mutationOptions.add),
  updateTask: getUpdateFunction(mutationOptions.edit),
  deleteTask: getUpdateFunction(mutationOptions.remove),
}
