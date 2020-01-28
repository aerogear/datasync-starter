/**
 * Note this whole file is a modified copy of something that exists in offix.
 * These changes will eventually land back in offix
 */


import { SubscribeToMoreOptions, OperationVariables, ObservableQuery } from "apollo-client";
import { QueryWithVariables, CacheUpdatesQuery, SubscribeToMoreUpdateFunction } from "offix-client-boost";
import { DocumentNode, OperationDefinitionNode } from "graphql";
import { CacheOperation } from "offix-client-boost";

export interface SubscriptionHelperOptions {
  subscriptionQuery: CacheUpdatesQuery;
  cacheUpdateQuery: CacheUpdatesQuery;
  operationType: CacheOperation;
  idField?: string;
}

/**
 * Helper function which can be used to call subscribeToMore for multiple SubscriptionHelperOptions
 * @param observableQuery the query which you would like to call subscribeToMore on.
 * @param arrayOfHelperOptions the array of `SubscriptionHelperOptions`
 */
export const subscribeToMoreHelper = (observableQuery: ObservableQuery,
                                      arrayOfHelperOptions: SubscriptionHelperOptions[]) => {
  for (const option of arrayOfHelperOptions) {
    observableQuery.subscribeToMore(createSubscriptionOptions(option));
  }
};

/**
 * Creates a SubscribeToMoreOptions object which can be used with Apollo Client's subscribeToMore function
 * on an observable query.
 * @param options see `SubscriptionHelperOptions`
 */
export const createSubscriptionOptions = (options: SubscriptionHelperOptions): SubscribeToMoreOptions => {
  const {
    subscriptionQuery,
    cacheUpdateQuery,
    operationType,
    idField = "id"
  } = options;
  const document = (subscriptionQuery && (subscriptionQuery as QueryWithVariables).query)
    || (subscriptionQuery as DocumentNode);
  const variables = (subscriptionQuery && (subscriptionQuery as QueryWithVariables).variables)
    || {} as OperationVariables;
  const query = (cacheUpdateQuery && (cacheUpdateQuery as QueryWithVariables).query)
    || (cacheUpdateQuery as DocumentNode);
  const queryField = getOperationName(query);

  return {
    document,
    variables,
    updateQuery: (prev, { subscriptionData }) => {
      const data = subscriptionData.data;
      const [key] = Object.keys(data);
      const mutadedItem = data[key];

      const optype = operationType;
      const obj = prev[queryField];

      const updater = getUpdateQueryFunction(optype, idField);
      const result = updater(obj, mutadedItem);
      return {
        [queryField]: result
      };
    }
  };
};

/**
 * Generate the standard update function to update the cache for a given operation type and query.
 * @param opType The type of operation being performed
 * @param idField The id field the item keys off
 */
export const getUpdateQueryFunction = (opType: CacheOperation, idField = "id"): SubscribeToMoreUpdateFunction => {
  let updateFunction: SubscribeToMoreUpdateFunction;

  switch (opType) {
    case CacheOperation.ADD:
      updateFunction = (prev, newItem) => {
        if (isConnectionType(prev)) {
          //@ts-ignore
          if (!newItem || prev.items.find((item: any) => item[idField] === newItem[idField])) {
            return prev
          } else {
            //@ts-ignore
            prev.items.push(newItem)
            return prev
          }
        } else {
          if (!newItem) {
            return [...prev];
          } else {
            return [...prev.filter(item => {
              return item[idField] !== newItem[idField];
            }), newItem];
          }
        }
      };
      break;
    case CacheOperation.REFRESH:
      updateFunction = (prev, newItem) => {
        if (isConnectionType(prev)) {
          if (!newItem) {
            return prev
          } else {
            //@ts-ignore
            prev.items = prev.items.map((item: any) => item[idField] === newItem[idField] ? newItem : item);
            return prev
          }
        } else {
          if (!newItem) {
            return [...prev];
          } else {
            return prev.map((item: any) => item[idField] === newItem[idField] ? newItem : item);
          }
        }
      };
      break;
    case CacheOperation.DELETE:
      updateFunction = (prev, newItem) => {
        if (isConnectionType(prev)) {
          if (!newItem) {
            return prev
          } else {
            //@ts-ignore
            prev.items = prev.items.filter((item: any) => item[idField] !== newItem[idField]);
            return prev
          }
        } else {
          if (!newItem) {
            return [];
          } else {
            return prev.filter((item: any) => item[idField] !== newItem[idField]);
          }
        }
      };
      break;
    default:
      updateFunction = prev => prev;
  }

  return updateFunction;
};

function getOperationName (operationName: DocumentNode) {
  const definition = operationName.definitions.find(def => def.kind === "OperationDefinition");
  const operationDefinition = definition && definition as OperationDefinitionNode;
  return operationDefinition && operationDefinition.name && operationDefinition.name.value;
};

function isConnectionType(type: any) {
  const isConnection = type.__typename && type.__typename.includes('Connection') && Array.isArray(type.items)
  return isConnection
}