import { getUpdateFunction, CacheOperation } from 'offix-cache';
import { GET_TASKS } from '../gql/queries';


// const options = {
//   updateQuery: GET_TASKS,
//   returnType: 'Task',
// };

export const mutationOptions = {
  add: {
    updateQuery: GET_TASKS,
    returnType: 'Task',
    mutationName: 'createTask',
    operationType: CacheOperation.ADD,
  },
  
  edit: {
    updateQuery: GET_TASKS,
    returnType: 'Task',
    mutationName: 'updateTask',
    operationType: CacheOperation.REFRESH,
  },
  
  remove: {
    updateQuery: GET_TASKS,
    returnType: 'Task',
    mutationName: 'deleteTask',
    operationType: CacheOperation.DELETE,
  },
};

export const taskCacheUpdates = {
  createTask: getUpdateFunction(mutationOptions.add),
  updateTask: getUpdateFunction(mutationOptions.edit),
  deleteTask: getUpdateFunction(mutationOptions.remove),
}
