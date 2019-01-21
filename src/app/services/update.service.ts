import { GET_TASKS } from './graphql.queries';

export class UpdateService {
  // Local cache updates for CRUD operations
  static updateCacheOnAdd(cache, { data: { createTask } }) {
    const { allTasks } = cache.readQuery({ query: GET_TASKS });
    cache.writeQuery({
      query: GET_TASKS,
      data: {
        'allTasks': allTasks.concat([createTask])
      }
    });
  }

  static updateCacheOnEdit(cache, { data: { updateTask } }) {
    const { allTasks } = cache.readQuery({ query: GET_TASKS });
    if (allTasks) {
      const index = allTasks.findIndex((task) => {
        return updateTask.id === task.id;
      });
      allTasks[index] = updateTask;
    }
    cache.writeQuery({
      query: GET_TASKS,
      data: {
        'allTasks': allTasks
      }
    });
  }

  static updateCacheOnDelete(cache, { data: { deleteTask } }) {
    let deletedId;
    if (deleteTask.__optimisticResponse) {
      // Map optimistic response field
      deletedId = deleteTask.id;
    } else {
      deletedId = deleteTask;
    }

    const { allTasks } = cache.readQuery({ query: GET_TASKS });
    const newData = allTasks.filter((item) => {
      return deletedId !== item.id;
    });
    cache.writeQuery({
      query: GET_TASKS,
      data: {
        'allTasks': newData
      }
    });
  }
}
