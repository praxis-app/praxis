import { isAxiosError } from 'axios';
import { toast } from 'sonner';
import { t } from './shared.utils';

const ACCOUNT_SUSPENDED = 'This account is suspended.';
const ACCOUNT_SUSPENDED_TOAST_ID = 'account-suspended';

export const isUnauthorizedError = (error: Error) =>
  isAxiosError(error) && error.response?.status === 401;

export const isAccountSuspendedError = (error: Error) =>
  isUnauthorizedError(error) &&
  isAxiosError(error) &&
  error.response?.data?.error === ACCOUNT_SUSPENDED;

export const notifyAccountSuspended = () => {
  toast(t('auth.errors.accountSuspended'), { id: ACCOUNT_SUSPENDED_TOAST_ID });
};
