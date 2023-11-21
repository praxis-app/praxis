import { InMemoryCache, makeVar } from '@apollo/client';
import { AlertColor } from '@mui/material';
import { INVITE_TOKEN } from '../constants/server-invite.constants';
import { getLocalStorageItem } from '../utils/shared.utils';

interface ToastNotification {
  status: AlertColor;
  title: string;
}

// App state
export const toastVar = makeVar<ToastNotification | null>(null);
export const isNavDrawerOpenVar = makeVar(false);

// Authentication state
export const isLoggedInVar = makeVar(false);
export const isAuthLoadingVar = makeVar(false);
export const authFailedVar = makeVar(false);
export const inviteTokenVar = makeVar(getLocalStorageItem(INVITE_TOKEN));

const cache = new InMemoryCache({
  possibleTypes: {
    FeedItem: ['Post', 'Proposal'],
  },
});

export default cache;
