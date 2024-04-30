import { InMemoryCache, makeVar } from '@apollo/client';
import { AlertColor } from '@mui/material';
import { LocalStorageKey } from '../constants/shared.constants';
import { ScrollDirection } from '../hooks/shared.hooks';

interface ToastNotification {
  status: AlertColor;
  title: string;
}

// App state
export const isNavDrawerOpenVar = makeVar(false);
export const scrollDirectionVar = makeVar<ScrollDirection>(null);
export const toastVar = makeVar<ToastNotification | null>(null);

// Authentication state
export const isLoggedInVar = makeVar(false);
export const isAuthLoadingVar = makeVar(false);
export const isAuthErrorVar = makeVar(false);
export const isAuthDoneVar = makeVar(false);
export const isVerifiedVar = makeVar(false);
export const inviteTokenVar = makeVar(
  localStorage.getItem(LocalStorageKey.InviteToken),
);

// Image state
export const imagesVar = makeVar<Record<number, string>>({});

const cache = new InMemoryCache({
  possibleTypes: {
    FeedItem: ['Post', 'Proposal'],
  },

  typePolicies: {
    Query: {
      fields: {
        posts: {
          merge(_, incoming) {
            return incoming;
          },
        },
        group: {
          merge(_, incoming) {
            return incoming;
          },
        },
        groups: {
          merge(_, incoming) {
            return incoming;
          },
        },
        memberRequests: {
          merge(_, incoming) {
            return incoming;
          },
        },
        serverRoles: {
          merge(_, incoming) {
            return incoming;
          },
        },
        serverInvites: {
          merge(_, incoming) {
            return incoming;
          },
        },
        notifications: {
          merge(_, incoming) {
            return incoming;
          },
        },
        questionnaireTickets: {
          merge(_, incoming) {
            return incoming;
          },
        },
        serverQuestions: {
          merge(_, incoming) {
            return incoming;
          },
        },
      },
    },
    User: {
      fields: {
        homeFeed: {
          merge(_, incoming) {
            return incoming;
          },
        },
        serverPermissions: {
          merge(_, incoming) {
            return incoming;
          },
        },
      },
    },
    Post: {
      fields: {
        images: {
          merge(_, incoming) {
            return incoming;
          },
        },
      },
    },
    Proposal: {
      fields: {
        images: {
          merge(_, incoming) {
            return incoming;
          },
        },
      },
    },
    Group: {
      fields: {
        posts: {
          merge(_, incoming) {
            return incoming;
          },
        },
        members: {
          merge(_, incoming) {
            return incoming;
          },
        },
        memberRequests: {
          merge(_, incoming) {
            return incoming;
          },
        },
        myPermissions: {
          merge(_, incoming) {
            return incoming;
          },
        },
      },
    },
    GroupRole: {
      fields: {
        availableUsersToAdd: {
          merge(_, incoming) {
            return incoming;
          },
        },
        members: {
          merge(_, incoming) {
            return incoming;
          },
        },
      },
    },
    ServerRole: {
      fields: {
        availableUsersToAdd: {
          merge(_, incoming) {
            return incoming;
          },
        },
        members: {
          merge(_, incoming) {
            return incoming;
          },
        },
      },
    },
    Conversation: {
      fields: {
        messages: {
          merge(existing = [], incoming) {
            return [...incoming, ...existing];
          },
          keyArgs: false,
        },
      },
    },
  },
});

export default cache;
