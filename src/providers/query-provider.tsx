"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { useState, useEffect } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes - data is considered fresh for 5 minutes
            gcTime: 10 * 60 * 1000, // 10 minutes - cache persists for 10 minutes (formerly cacheTime)
            refetchOnMount: false, // Don't refetch on mount if data is fresh
            refetchOnWindowFocus: false, // Don't refetch on window focus
            refetchOnReconnect: false, // Don't refetch on reconnect
            retry: 1,
          },
        },
      })
  );

  const [persister, setPersister] = useState<ReturnType<typeof createSyncStoragePersister> | null>(null);

  useEffect(() => {
    // Only create persister on client side
    if (typeof window !== "undefined") {
      const storagePersister = createSyncStoragePersister({
        storage: window.localStorage,
        key: "REACT_QUERY_OFFLINE_CACHE",
        serialize: JSON.stringify,
        deserialize: JSON.parse,
      });
      setPersister(storagePersister);
    }
  }, []);

  if (!persister) {
    // Fallback to regular provider while persister is being set up
    return (
      <QueryClientProvider client={queryClient}>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    );
  }

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: 10 * 60 * 1000, // 10 minutes - same as gcTime
        buster: "", // Change this to invalidate cache when needed
      }}
    >
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </PersistQueryClientProvider>
  );
}

