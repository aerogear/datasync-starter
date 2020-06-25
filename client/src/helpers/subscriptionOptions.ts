import { createSubscriptionOptions, CacheOperation } from 'offix-cache';
import { newTask, updatedTask, deletedTask, findTasks, getTask, newComment } from '../graphql/generated';

export const add = createSubscriptionOptions({
  subscriptionQuery: newTask,
  cacheUpdateQuery: findTasks,
  operationType: CacheOperation.ADD,
  returnField: 'items'
});

export const edit = createSubscriptionOptions({
  subscriptionQuery: updatedTask,
  cacheUpdateQuery: findTasks,
  operationType: CacheOperation.REFRESH,
  returnField: 'items'
});

export const remove = createSubscriptionOptions({
  subscriptionQuery: deletedTask,
  cacheUpdateQuery: findTasks,
  operationType: CacheOperation.DELETE,
  returnField: 'items'
});

export const addComment = createSubscriptionOptions({
  subscriptionQuery: newComment,
  cacheUpdateQuery: getTask,
  operationType: CacheOperation.ADD,
  returnField: 'comments'
});