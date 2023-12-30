import { ApolloCache, FetchResult } from '@apollo/client';
import { produce } from 'immer';
import { TypeNames } from '../constants/shared.constants';
import { toastVar } from '../graphql/cache';
import { DeleteGroupMutation } from '../graphql/groups/mutations/gen/DeleteGroup.gen';
import {
  GroupsDocument,
  GroupsQuery,
} from '../graphql/groups/queries/gen/Groups.gen';
import {
  ServerInvitesDocument,
  ServerInvitesQuery,
} from '../graphql/invites/queries/gen/ServerInvites.gen';
import { DeletePostMutation } from '../graphql/posts/mutations/gen/DeletePost.gen';

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
          const index = draft.groups.nodes.findIndex((p) => p.id === id);
          draft.groups.nodes.splice(index, 1);
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
