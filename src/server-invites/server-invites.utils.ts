import { ServerInvite } from './models/server-invite.model';

export const validateServerInvite = (serverInvite: ServerInvite) => {
  const isExpired =
    serverInvite.expiresAt && Date.now() >= Number(serverInvite.expiresAt);
  const maxUsesReached =
    serverInvite.maxUses && serverInvite.uses >= serverInvite.maxUses;

  if (isExpired || maxUsesReached) {
    return false;
  }
  return true;
};
