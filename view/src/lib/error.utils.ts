import { AxiosError } from 'axios';
import { toast } from 'sonner';
import { t } from './shared.utils';

export const handleError = (error: Error) => {
  if (error instanceof AxiosError && error.response?.data) {
    const data = error.response.data;
    toast(typeof data === 'string' ? data : data.error || data.message);
    return;
  }
  toast(error.message || t('errors.somethingWentWrong'));
};
