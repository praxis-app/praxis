import { type PollActionType } from '@/types/poll-action.types';
import { type DecisionMakingModel } from '@/types/poll.types';

export const ACTION_TRANSLATION_KEYS = {
  general: 'proposals.actionTypes.general',
  'change-settings': 'proposals.actionTypes.changeSettings',
  'change-role': 'proposals.actionTypes.changeRole',
  'create-role': 'proposals.actionTypes.createRole',
  'plan-event': 'proposals.actionTypes.planEvent',
  test: 'proposals.actionTypes.test',
} as const satisfies Record<PollActionType, string>;

export const MODEL_TRANSLATION_KEYS = {
  consent: 'proposals.labels.consent',
  consensus: 'proposals.labels.consensus',
  'majority-vote': 'proposals.labels.majority',
} as const satisfies Record<DecisionMakingModel, string>;

/** Narrow screens trade the full action name for a shorter one */
export const SHORT_ACTION_TRANSLATION_KEYS = {
  general: 'proposals.actionTypes.generalShort',
  'change-settings': 'proposals.actionTypes.changeSettings',
  'change-role': 'proposals.actionTypes.changeRole',
  'create-role': 'proposals.actionTypes.createRole',
  'plan-event': 'proposals.actionTypes.planEvent',
  test: 'proposals.actionTypes.test',
} as const satisfies Record<PollActionType, string>;

/** Narrow screens trade the full model name for a shorter one */
export const SHORT_MODEL_TRANSLATION_KEYS = {
  consent: 'proposals.labels.consent',
  consensus: 'proposals.labels.consensus',
  'majority-vote': 'proposals.labels.majorityShort',
} as const satisfies Record<DecisionMakingModel, string>;
