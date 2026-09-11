export enum Commands {
  Summary = '/summary',
  Consensus = '/consensus',
  Disagreements = '/disagreements',
  Compromises = '/compromises',
  DraftProposal = '/draft-proposal',
}

export const COMMAND_STATUS = ['processing', 'completed', 'failed'] as const;
