import { QueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';

const MAX_QUERY_RETRIES = 3;

const shouldRetryQuery = (failureCount: number, error: Error) => {
  const status = isAxiosError(error) ? error.response?.status : undefined;
  if (status && status >= 400 && status < 500) {
    return false;
  }
  return failureCount < MAX_QUERY_RETRIES;
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: shouldRetryQuery },
  },
});
