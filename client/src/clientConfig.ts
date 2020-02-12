import { InMemoryCache } from 'apollo-cache-inmemory';
import { split } from 'apollo-link';
import { HttpLink } from 'apollo-link-http';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';
import { ConflictListener } from 'offix-client';
import { taskCacheUpdates } from './helpers';
import { FRAGMENT } from './gql/queries';

const wsLink = new WebSocketLink({
  uri: 'ws://localhost:4000/graphql',
  options: {
    reconnect: true,
    lazy: true,
  },
});

const httpLink = new HttpLink({
  uri: 'http://localhost:4000/graphql',
});

class ConflictLogger implements ConflictListener {
  conflictOccurred(operationName:any, resolvedData:any, server:any, client:any) {
    console.log("Conflict occurred with the following:")
    console.log(`data: ${JSON.stringify(resolvedData)}, server: ${JSON.stringify(server)}, client: ${JSON.stringify(client)}, operation:  ${JSON.stringify(operationName)}`);
  }
  mergeOccurred(operationName:any, resolvedData:any, server:any, client:any) {
    console.log("Merge occurred with the following:")
    console.log(`data: ${JSON.stringify(resolvedData)}, server: ${JSON.stringify(server)}, client: ${JSON.stringify(client)}, operation:  ${JSON.stringify(operationName)}`);
  }
}

const link = split(
  ({ query }) => {
    // @ts-ignore
    const { kind, operation} = getMainDefinition(query);
    return kind === 'OperationDefinition' && operation === 'subscription';
  },
  wsLink,
  httpLink,
);

export const clientConfig = {
  link,
  cache: new InMemoryCache(),
  resolvers: {
    Query: {
      // @ts-ignore
      getTask: async (_, variables, { cache, getCacheKey }) => {
        const id = getCacheKey({ __typename: 'Task', id: variables.id });
        const data = cache.readFragment({ id, fragment: FRAGMENT });
        console.log('here');
        return {
          ...data,
          __typename: 'Task'
        };
      }
    },
  },
  conflictListener: new ConflictLogger(),
  mutationCacheUpdates: taskCacheUpdates,
};
