export enum PubSubMessageType {
  MESSAGE = 'message',
  THREAD_REPLY = 'threadReply',
  POLL = 'poll',
  CALL = 'call',
  PROPOSAL_MOVED = 'proposalMoved',
  SERVER_ACCESS_REVOKED = 'server-access-revoked',
}

export enum PubSubMessageAction {
  REMOVED = 'removed',
}
