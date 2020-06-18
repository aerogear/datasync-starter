import { useCallback, useEffect, useState, useReducer } from "react";
import { observe, save, query, remove } from 'offix-datastore';

enum Actions {
  REQ_START,
  REQ_SUCCESS,
  REQ_FAILED
}

function reducer(state: any, action: { type: Actions, payload?: any }) {
    switch (action.type) {
        case Actions.REQ_START:
            return { ...state, isLoading: true, data: null, error: null };
        case Actions.REQ_SUCCESS:
            return { ...state, isLoading: false, data: action.payload, error: null };
        case Actions.REQ_FAILED:
            return { ...state, isLoading: false, data: null, error: action.payload };
        default:
            throw new Error("Invalid action");
    }
}

const initialState = {
    data: null,
    isLoading: false,
    error: null
};

export function useSaveTask() {
    const [state, dispatch] = useReducer(reducer, initialState);

    async function saveTask(task: any) {
        dispatch({ type: Actions.REQ_START });
        try {
            const result = await save({ ...task, __typename: "Task" });
            dispatch({ type: Actions.REQ_SUCCESS, payload: result });
        } catch (error) {
            dispatch({ type: Actions.REQ_FAILED, payload: error });
        }
    }

    return {
        save: saveTask,
        ...state,
    }
}

export function useFindTasks() {
    const [state, dispatch] = useReducer(reducer, initialState);
    const [params, setParams] = useState({ paginate: null });

    function doQuery(predicate?: any) {
        setParams((p) => ({ ...p, predicate }));
    }

    const fetchData = useCallback(async () => {
        dispatch({ type: Actions.REQ_START });
        try {
            const result = await query({ __typename: "Task" }, (params as any).predicate);
            dispatch({ type: Actions.REQ_SUCCESS, payload: result });
        } catch (error) {
            dispatch({ type: Actions.REQ_FAILED, payload: error });
        }
    }, [params]);

    useEffect(() => {
        const subscription = observe({ __typename: "Task" }, (msg: any) => {
            console.log(msg);
            fetchData();
        });

        return () => subscription.unsubscribe();
    }, [fetchData]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        query: doQuery,
        ...state,
    }
}

export function useDeleteTask() {
    const [state, dispatch] = useReducer(reducer, initialState);

    async function deleteTask(task: any) {
        dispatch({ type: Actions.REQ_START });
        try {
            const result = await remove({ ...task, __typename: "Task" });
            dispatch({ type: Actions.REQ_SUCCESS, payload: result });
        } catch (error) {
            dispatch({ type: Actions.REQ_FAILED, payload: error });
        }
    }

    return {
        delete: deleteTask,
        ...state,
    }
}
