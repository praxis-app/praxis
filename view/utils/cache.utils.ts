import { ApolloCache, FetchResult, Reference } from '@apollo/client';
import { produce } from 'immer';
import { TypeNames } from '../constants/shared.constants';
import { toastVar } from '../graphql/cache';
import { MessageFragment } from '../graphql/chat/fragments/gen/Message.gen';
import { DeleteGroupMutation } from '../graphql/groups/mutations/gen/DeleteGroup.gen';
import {
  GroupsDocument,
  GroupsQuery,
} from '../graphql/groups/queries/gen/Groups.gen';
import {
  ServerInvitesDocument,
  ServerInvitesQuery,
} from '../graphql/invites/queries/gen/ServerInvites.gen';
import {
  NotificationsDocument,
  NotificationsQuery,
} from '../graphql/notifications/queries/gen/Notifications.gen';
import {
  UnreadNotificationsDocument,
  UnreadNotificationsQuery,
} from '../graphql/notifications/queries/gen/UnreadNotifications.gen';
import { NotifiedSubscription } from '../graphql/notifications/subscriptions/gen/Notified.gen';
import { DeletePostMutation } from '../graphql/posts/mutations/gen/DeletePost.gen';
import { DeleteUserMutation } from '../graphql/users/mutations/gen/DeleteUser.gen';

export const addNotification = (
  cache: ApolloCache<any>,
  data: NotifiedSubscription,
) => {
  cache.updateQuery<NotificationsQuery>(
    {
      query: NotificationsDocument,
      variables: { limit: 10, offset: 0 },
    },
    (notificationsData) =>
      produce(notificationsData, (draft) => {
        if (!draft) {
          return;
        }
        draft.notifications.unshift(data.notification);
        draft.notificationsCount += 1;
      }),
  );
  cache.updateQuery<UnreadNotificationsQuery>(
    { query: UnreadNotificationsDocument },
    (notificationsData) =>
      produce(notificationsData, (draft) => {
        if (!draft) {
          return;
        }
        draft.unreadNotificationsCount += 1;
      }),
  );
};

export const addNewMessage = (
  cache: ApolloCache<object>,
  newMessage: MessageFragment,
  chatId: number,
) => {
  cache.modify({
    id: cache.identify({ id: chatId, __typename: TypeNames.Conversation }),
    fields: {
      messages(existingRefs, { toReference, readField }) {
        const alreadyReceived = existingRefs.some(
          (ref: Reference) => readField('id', ref) === newMessage.id,
        );
        if (alreadyReceived) {
          return existingRefs;
        }
        return [...existingRefs, toReference(newMessage)].sort((a, b) => {
          const aCreatedAt = new Date(readField('createdAt', a) as Date);
          const bCreatedAt = new Date(readField('createdAt', b) as Date);
          return aCreatedAt.getTime() - bCreatedAt.getTime();
        });
      },
    },
  });
};

export const removeUser =
  (id: number) =>
  (cache: ApolloCache<any>, { errors }: FetchResult<DeleteUserMutation>) => {
    if (errors) {
      toastVar({ status: 'error', title: errors[0].message });
      return;
    }
    const cacheId = cache.identify({ id, __typename: TypeNames.User });
    cache.evict({ id: cacheId });
    cache.gc();
  };

export const removePost =
  (postId: number) =>
  (cache: ApolloCache<any>, { errors }: FetchResult<DeletePostMutation>) => {
    if (errors) {
      toastVar({ status: 'error', title: errors[0].message });
      return;
    }
    const postCacheId = cache.identify({
      __typename: TypeNames.Post,
      id: postId,
    });
    cache.evict({ id: postCacheId });
    cache.gc();
  };

export const removeProposal =
  (proposalId: number) => (cache: ApolloCache<any>) => {
    const proposalCacheId = cache.identify({
      __typename: TypeNames.Proposal,
      id: proposalId,
    });
    cache.evict({ id: proposalCacheId });
    cache.gc();
  };

export const removeGroup =
  (id: number) =>
  (cache: ApolloCache<any>, { errors }: FetchResult<DeleteGroupMutation>) => {
    if (errors) {
      toastVar({ status: 'error', title: errors[0].message });
      return;
    }
    cache.updateQuery<GroupsQuery>(
      {
        query: GroupsDocument,
        variables: { limit: 10, offset: 0 },
      },
      (groupsData) =>
        produce(groupsData, (draft) => {
          if (!draft) {
            return;
          }
          const index = draft.groups.findIndex((p) => p.id === id);
          draft.groups.splice(index, 1);
          draft.groupsCount -= 1;
        }),
    );
    const cacheId = cache.identify({ id, __typename: TypeNames.Group });
    cache.evict({ id: cacheId });
    cache.gc();
  };

export const removeServerInvite = (id: number) => (cache: ApolloCache<any>) => {
  cache.updateQuery<ServerInvitesQuery>(
    { query: ServerInvitesDocument },
    (invitesData) =>
      produce(invitesData, (draft) => {
        if (!draft) {
          return;
        }
        const index = draft.serverInvites.findIndex((p) => p.id === id);
        draft.serverInvites.splice(index, 1);
      }),
  );
  const cacheId = cache.identify({ id, __typename: TypeNames.ServerInvite });
  cache.evict({ id: cacheId });
  cache.gc();
};
