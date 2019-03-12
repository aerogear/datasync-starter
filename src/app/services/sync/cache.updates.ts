import { GET_TASKS } from './graphql.queries';

export const taskCacheUpdates = {
    createTask: (cache, { data }) => {
        data = data.createTask;
        let { allTasks } = cache.readQuery({ query: GET_TASKS });
        if (allTasks) {
            if (!allTasks.find((task) => task.id === data.id)) {
                allTasks.push(data);
            }
        } else {
            allTasks = [data];
        }
        cache.writeQuery({
            query: GET_TASKS,
            data: {
                'allTasks': allTasks
            }
        });
    },

    updateTask: (cache, { data }) => {
        data = data.updateTask;
        const { allTasks } = cache.readQuery({ query: GET_TASKS });
        if (allTasks) {
            const index = allTasks.findIndex((task) => {
                return data.id === task.id;
            });
            allTasks[index] = data;
        }
        cache.writeQuery({
            query: GET_TASKS,
            data: {
                'allTasks': allTasks
            }
        });
    },

    deleteTask: (cache, { data }) => {
        data = data.deleteTask;
        let deletedId;
        if (data.optimisticResponse) {
            // Map optimistic response field
            deletedId = data.id;
        } else {
            deletedId = data;
        }

        const { allTasks } = cache.readQuery({ query: GET_TASKS, });
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
};
