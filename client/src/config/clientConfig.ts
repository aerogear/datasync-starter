import { ApolloLink } from 'apollo-link';
import { HttpLink } from 'apollo-link-http';
import { WebSocketLink } from 'apollo-link-ws';
import { setContext } from 'apollo-link-context';
import { getMainDefinition } from 'apollo-utilities';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { globalCacheUpdates, ConflictLogger } from '../helpers';
import { getAuthHeader } from '../auth/keycloakAuth';
import { WebNetworkStatus } from './WebNetworkStatus';
import { ApolloOfflineClientOptions, VersionedState, ConflictResolutionData } from 'offix-client';

const httpUri = process.env.REACT_APP_SERVER_URL || 'http://localhost:4000/graphql';
const httpsEnabled = httpUri.startsWith('https://')
const httpEnabled = httpUri.startsWith('http://')

if (!httpEnabled && !httpsEnabled) {
  throw new Error(`invalid server url ${httpUri} must begin with https:// or http://`)
}

const wsUri = httpsEnabled ? httpUri.replace('https://', 'wss://') : httpUri.replace('http://', 'ws://')

/**
 * Create websocket link and
 * define websocket link options
 * 
 */
const wsLink = new WebSocketLink({
  uri: wsUri,
  options: {
    reconnect: true,
    lazy: true,
    // returns auth header or empty string
    connectionParams: async () => (await getAuthHeader())
  },
});

const httpLink = new HttpLink({
  uri: httpUri,
});

/**
 * add authorization headers for queries
 * to grapqhql backend
 * 
 */
const authLink = setContext(async (_, { headers }) => {
  return {
    headers: {
      ...headers,
      // returns auth header or empty string
      ...await getAuthHeader()
    }
  }
});

/**
 * split queries and subscriptions.
 * send subscriptions to websocket url &
 * queries to http url
 * 
 */
const splitLink = ApolloLink.split(
  ({ query }) => {
    const { kind, operation }: any = getMainDefinition(query);
    return kind === 'OperationDefinition' && operation === 'subscription';
  },
  wsLink,
  httpLink,
);

/**
 * Instantiate cache object
 * and define cache redirect queries
 * 
 */
const cache = new InMemoryCache({
  // cache redirects are used
  // to query the cache for individual Task item
  cacheRedirects: {
    Query: {
      findTasks: (_, { fields }, { getCacheKey }) => getCacheKey({ __typename: 'Task', id: fields.id }),
    },
  },
});

// TODO remove this once we have
class InputNamespacedVersionSpace extends VersionedState {
  public assignServerState(client: any, server: any): void {
    client.version = server.version;
  }
  public hasConflict(client: any, server: any): boolean {
    return client.version !== server.version;
  }
  public getStateFields(): string[] {
    // Id should be removed because we don't need to compare it for conflicts
    return ["version", "id"];
  }

  public currentState(currentObjectState: ConflictResolutionData) {
    return currentObjectState.input.version;
  }

}

const offixState = new InputNamespacedVersionSpace();

export const clientConfig: ApolloOfflineClientOptions = {
  link: authLink.concat(splitLink),
  cache: cache,
  conflictListener: new ConflictLogger(),
  mutationCacheUpdates: globalCacheUpdates,
  networkStatus: new WebNetworkStatus(),
  conflictProvider: offixState
};
