import { getUpdateFunction, CacheOperation } from 'offix-cache';
import { findTasks } from '../graphql/generated';

export const createTask = {
  updateQuery: findTasks,
  returnType: 'Task',
  mutationName: 'createTask',
  operationType: CacheOperation.ADD,
};

export const updateTask = {
  updateQuery: findTasks,
  returnType: 'Task',
  mutationName: 'updateTask',
  operationType: CacheOperation.REFRESH,
};

export const deleteTask = {
  updateQuery: findTasks,
  returnType: 'Task',
  mutationName: 'deleteTask',
  operationType: CacheOperation.DELETE,
};

export const globalCacheUpdates = {
  createTask: getUpdateFunction(createTask),
  updateTask: getUpdateFunction(updateTask),
  deleteTask: getUpdateFunction(deleteTask),
}
