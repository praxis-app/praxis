import { formatVotingTimeLimit } from '@/lib/poll.utils';
import {
  type ServerConfigReq,
  type ServerConfigRes,
} from '@/types/server-config.types';
import { t } from 'i18next';

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

export type ServerConfigField = (typeof SERVER_CONFIG_FIELDS)[number];

const DECISION_MAKING_MODEL_LABEL_KEYS = {
  consent: 'proposals.labels.consent',
  consensus: 'proposals.labels.consensus',
  'majority-vote': 'proposals.labels.majority',
} as const;

export const isServerConfigField = (key: string): key is ServerConfigField =>
  SERVER_CONFIG_FIELDS.includes(key as ServerConfigField);

export const formatServerConfigValue = (
  field: ServerConfigField,
  value: unknown,
): string => {
  if (typeof value === 'boolean') {
    return t(value ? 'actions.enabled' : 'actions.disabled');
  }
  if (field === 'votingTimeLimit') {
    return formatVotingTimeLimit(Number(value));
  }
  if (field === 'agreementThreshold' || field === 'quorumThreshold') {
    return `${String(value)}%`;
  }
  if (field === 'decisionMakingModel') {
    const labelKey =
      DECISION_MAKING_MODEL_LABEL_KEYS[
        String(value) as keyof typeof DECISION_MAKING_MODEL_LABEL_KEYS
      ];
    return labelKey ? t(labelKey) : String(value);
  }
  return String(value);
};

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
