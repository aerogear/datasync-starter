import { CacheItem } from 'offix-cache';
import { newTask, updatedTask, deletedTask } from '../graphql/generated';

export const add = {
  document: newTask,
  updateQuery: (prev: CacheItem, { subscriptionData } : { subscriptionData: CacheItem }) => {
    if (!subscriptionData.data) return prev;
    const op = subscriptionData.data;
    return {
      findTasks: {
        ...prev.findTasks,
        items: [
          ...prev.findTasks.items.filter((item: CacheItem) => {
          return item.id !== op.newTask.id;
        }), op.newTask]
      }
    };
  }
}

export const edit = {
  document: updatedTask,
  updateQuery: (prev: CacheItem, { subscriptionData } : { subscriptionData: CacheItem }) => {
    if (!subscriptionData.data) return prev;
    // TODO
  }
};

export const remove = {
  document: deletedTask,
  updateQuery: (prev: CacheItem, { subscriptionData } : { subscriptionData: CacheItem }) => {
    if (!subscriptionData.data) return prev;
    const op = subscriptionData.data;
    const items = prev.findTasks.items.filter((item: CacheItem) => item.id !== op.deletedTask.id);
    return {
      findTasks: {
        ...prev.findTasks,
        items
      }
    };
  }
}