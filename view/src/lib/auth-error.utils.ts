import { type Notice } from '@/store/notices.store';
import { isAxiosError } from 'axios';
import { t } from './shared.utils';

const ACCOUNT_SUSPENDED = 'This account is suspended.';
const ACCOUNT_DELETED = 'This account has been deleted.';

interface AuthErrorRes {
  error?: string;
  reason?: string | null;
  moderatedAt?: string | null;
}

export const isUnauthorizedError = (error: Error) =>
  isAxiosError(error) && error.response?.status === 401;

const getAuthErrorData = (error: Error): AuthErrorRes | undefined =>
  isUnauthorizedError(error) && isAxiosError(error)
    ? error.response?.data
    : undefined;

export const isAccountRevokedError = (error: Error) =>
  [ACCOUNT_SUSPENDED, ACCOUNT_DELETED].includes(
    getAuthErrorData(error)?.error ?? '',
  );

export const getAccountRevokedNotice = (error: Error): Notice => {
  const data = getAuthErrorData(error);
  const isDeleted = data?.error === ACCOUNT_DELETED;
  return {
    id: 'account',
    title: isDeleted
      ? t('moderation.notices.accountDeletedTitle')
      : t('moderation.notices.accountSuspendedTitle'),
    description: isDeleted
      ? t('moderation.notices.accountDeletedDescription')
      : t('moderation.notices.accountSuspendedDescription'),
    reason: data?.reason ?? null,
    moderatedAt: data?.moderatedAt ?? null,
  };
};
