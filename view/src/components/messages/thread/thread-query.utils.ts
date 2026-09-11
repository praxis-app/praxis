export const getThreadQueryKey = (
  serverId?: string,
  channelId?: string,
  rootKind?: 'message' | 'poll',
  rootId?: string,
  inviteToken?: string | null,
) => [
  'servers',
  serverId,
  'channels',
  channelId,
  rootKind,
  rootId,
  'replies',
  ...(inviteToken ? ['invite', inviteToken] : []),
];
