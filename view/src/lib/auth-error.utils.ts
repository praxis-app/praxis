import { isAxiosError } from 'axios';
import { toast } from 'sonner';
import { t } from './shared.utils';

const ACCOUNT_SUSPENDED = 'This account is suspended.';
const ACCOUNT_DELETED = 'This account has been deleted.';
const ACCOUNT_REVOKED_TOAST_ID = 'account-revoked';

export const isUnauthorizedError = (error: Error) =>
  isAxiosError(error) && error.response?.status === 401;

const getAuthErrorMessage = (error: Error) =>
  isUnauthorizedError(error) && isAxiosError(error)
    ? error.response?.data?.error
    : undefined;

export const isAccountRevokedError = (error: Error) =>
  [ACCOUNT_SUSPENDED, ACCOUNT_DELETED].includes(getAuthErrorMessage(error));

export const dismissAccountRevokedNotice = () => {
  toast.dismiss(ACCOUNT_REVOKED_TOAST_ID);
};

const showAccountRevokedNotice = (message: string) => {
  toast(message, {
    id: ACCOUNT_REVOKED_TOAST_ID,
    duration: Infinity,
    closeButton: true,
  });
};

export const notifyIfAccountRevoked = (error: Error) => {
  const message = getAuthErrorMessage(error);
  if (message === ACCOUNT_SUSPENDED) {
    showAccountRevokedNotice(t('auth.errors.accountSuspended'));
  }
  if (message === ACCOUNT_DELETED) {
    showAccountRevokedNotice(t('auth.errors.accountDeleted'));
  }
};
