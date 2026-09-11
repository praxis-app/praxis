import { DECISION_MAKING_MODEL } from '@/constants/poll.constants';
import { ServerConfigErrorKeys } from '@/constants/server-config.constants';
import { VotingTimeLimit } from '@/constants/vote.constants';
import * as zod from 'zod';
import { type DecisionMakingModel } from './poll.types';

export const serverConfigSchema = zod
  .object({
    anonymousUsersEnabled: zod.boolean().optional(),
    decisionMakingModel: zod.enum(DECISION_MAKING_MODEL).optional(),
    disagreementsLimit: zod.number().min(0).max(10).optional(),
    abstainsLimit: zod.number().min(0).max(10).optional(),
    agreementThreshold: zod.number().min(1).max(100).optional(),
    quorumEnabled: zod.boolean().optional(),
    quorumThreshold: zod.number().min(1).max(100).optional(),
    votingTimeLimit: zod.number().optional(),
    blocksOpenToAll: zod.boolean().optional(),
  })
  .refine(
    (data) =>
      !(
        data.decisionMakingModel === 'majority-vote' &&
        data.agreementThreshold !== undefined &&
        data.agreementThreshold <= 50
      ),
    {
      message: ServerConfigErrorKeys.MajorityVoteAgreementThreshold,
      path: ['agreementThreshold'],
    },
  )
  .refine(
    (data) =>
      !(
        data.decisionMakingModel === 'consent' &&
        data.votingTimeLimit === VotingTimeLimit.Unlimited
      ),
    {
      message: ServerConfigErrorKeys.ConsentVotingTimeLimitRequired,
      path: ['votingTimeLimit'],
    },
  );

export interface ServerConfigReq {
  anonymousUsersEnabled?: boolean;
  decisionMakingModel?: DecisionMakingModel;
  disagreementsLimit?: number;
  abstainsLimit?: number;
  agreementThreshold?: number;
  quorumEnabled?: boolean;
  quorumThreshold?: number;
  votingTimeLimit?: number;
  blocksOpenToAll?: boolean;
}

export interface ServerConfigRes {
  anonymousUsersEnabled: boolean;
  decisionMakingModel: DecisionMakingModel;
  disagreementsLimit: number;
  abstainsLimit: number;
  agreementThreshold: number;
  quorumEnabled: boolean;
  quorumThreshold: number;
  votingTimeLimit: number;
  blocksOpenToAll: boolean;
  updatedAt: Date;
}
