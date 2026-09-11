import {
  type ServerConfigReq,
  type ServerConfigRes,
} from '@/types/server-config.types';

export const SERVER_CONFIG_FIELDS = [
  'anonymousUsersEnabled',
  'decisionMakingModel',
  'disagreementsLimit',
  'abstainsLimit',
  'agreementThreshold',
  'quorumEnabled',
  'quorumThreshold',
  'votingTimeLimit',
  'blocksOpenToAll',
] as const;

export const getServerConfigChanges = (
  current: ServerConfigRes,
  proposed: ServerConfigReq,
) =>
  Object.fromEntries(
    SERVER_CONFIG_FIELDS.flatMap((field) =>
      proposed[field] !== undefined && proposed[field] !== current[field]
        ? [[field, proposed[field]]]
        : [],
    ),
  ) as ServerConfigReq;
