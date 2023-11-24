import { ApolloCache } from '@apollo/client';
import { produce } from 'immer';
import { TypeNames } from '../constants/shared.constants';
import {
  ServerInvitesDocument,
  ServerInvitesQuery,
} from '../graphql/invites/queries/gen/ServerInvites.gen';

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

export const copyInviteLink = async (token: string) => {
  const inviteLink = `${window.location.origin}/i/${token}`;
  await navigator.clipboard.writeText(inviteLink);
};
