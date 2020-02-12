import { useState, useEffect } from 'react';
import { useApolloOfflineClient } from 'react-offix-hooks';
import { useGetOfflineStore } from './useGetOfflineStore';

export const useOfflineQueueListener = () => {
  const client = useApolloOfflineClient();
  const [queue, setQueue] = useState(0);
  const offlineStore = useGetOfflineStore();

  useEffect(() => {
    if(offlineStore) setQueue((offlineStore.length));
  }, [setQueue, offlineStore]);

  useEffect(() => {
    client.registerOfflineEventListener({
      onOperationEnqueued() {
        setQueue(queue + 1);
      },
      queueCleared() {
        setQueue(0);
      },
      onOperationFailure: ({ op }) => {
        console.log({
          message: `Failed to replicate offline change: ${op.context.operationName}`
        });
      }
    });
  }, [client, queue]);
  return queue;
};
