import { AxiosError } from 'axios';
import { toast } from 'sonner';
import { queryClient } from './query-client';
import { t } from './shared.utils';

const FORBIDDEN = 'Forbidden.';

export const handleError = (error: Error) => {
  if (error instanceof AxiosError && error.response?.data) {
    const data = error.response.data;
    const message =
      typeof data === 'string' ? data : data.error || data.message;

    if (error.response.status === 403) {
      queryClient.invalidateQueries({
        predicate: ({ queryKey }) =>
          queryKey[0] === 'servers' && queryKey[2] === 'access',
      });
      toast(message === FORBIDDEN ? t('errors.forbidden') : message);
      return;
    }
    toast(message);
    return;
  }
  toast(error.message || t('errors.somethingWentWrong'));
};
