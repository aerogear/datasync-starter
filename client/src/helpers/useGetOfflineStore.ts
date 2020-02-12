import  { useEffect, useState } from "react";
import { useApolloOfflineClient } from "react-offix-hooks";

/**
 * React hook to detect network changes
 * and return current network state
 *
 * Usage: const isOnline = useNetworkStatus();
 *
 */
export function useGetOfflineStore(){
  const client = useApolloOfflineClient();
  const [offlineStore, setOfflineStore] = useState();

  useEffect(() => {
    const getOfflineStore  = async () => {
      const store = await client.offlineStore?.getOfflineData();
      setOfflineStore(store);
    };

    getOfflineStore();
  }, [client]);

  return offlineStore;
};
