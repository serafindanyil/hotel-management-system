import { QueryClient } from '@tanstack/react-query';

import { NetworkError } from './network-error';

const MAX_QUERY_NETWORK_RETRIES = 1;

const shouldRetryQuery = (failureCount: number, error: Error): boolean =>
  error instanceof NetworkError && failureCount < MAX_QUERY_NETWORK_RETRIES;

export const createQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: shouldRetryQuery },
      mutations: { retry: false },
    },
  });
