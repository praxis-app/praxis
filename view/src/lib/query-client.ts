import {
  MutationCache,
  QueryCache,
  QueryClient,
  type QueryKey,
} from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import {
  isAccountSuspendedError,
  isUnauthorizedError,
  notifyAccountSuspended,
} from './auth-error.utils';

const MAX_QUERY_RETRIES = 3;

const shouldRetryQuery = (failureCount: number, error: Error) => {
  const status = isAxiosError(error) ? error.response?.status : undefined;
  if (status && status >= 400 && status < 500) {
    return false;
  }
  return failureCount < MAX_QUERY_RETRIES;
};

const endRevokedSession = (error: Error, queryKey?: QueryKey) => {
  if (!isUnauthorizedError(error)) {
    return;
  }
  if (isAccountSuspendedError(error)) {
    notifyAccountSuspended();
  }
  if (queryKey?.[0] !== 'me') {
    void queryClient.invalidateQueries(
      { queryKey: ['me'], exact: true },
      { cancelRefetch: false },
    );
  }
};

export const queryClient: QueryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => endRevokedSession(error, query.queryKey),
  }),
  mutationCache: new MutationCache({
    onError: (error) => endRevokedSession(error),
  }),
  defaultOptions: {
    queries: { retry: shouldRetryQuery },
  },
});
