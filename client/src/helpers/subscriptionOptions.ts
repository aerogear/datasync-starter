import { createSubscriptionOptions } from 'offix-client';
import { CacheOperation } from 'offix-cache';
import { findTasks } from '../graphql/generated';
import { newTask } from '../graphql/generated';
import { updatedTask } from '../graphql/generated';
import { deletedTask } from '../graphql/generated';

// use offix-client helpers to create the required
// subscription options for an `add` event
export const add = createSubscriptionOptions({
  subscriptionQuery: newTask,
  cacheUpdateQuery: findTasks,
  operationType: CacheOperation.ADD,
});

// use offix-client helpers to create the required
// subscription options for an `update` event
export const edit = createSubscriptionOptions({
  subscriptionQuery: updatedTask,
  cacheUpdateQuery: findTasks,
  operationType: CacheOperation.REFRESH,
});

export const remove = createSubscriptionOptions({
  subscriptionQuery: deletedTask,
  cacheUpdateQuery: findTasks,
  operationType: CacheOperation.DELETE,
});
