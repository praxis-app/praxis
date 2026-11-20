export enum PubSubMessageType {
  MESSAGE = 'message',
  MESSAGE_REMOVED = 'message-removed',
  THREAD_REPLY = 'thread-reply',
  THREAD_REPLY_REMOVED = 'thread-reply-removed',
  POLL = 'poll',
  CALL = 'call',
  PROPOSAL_MOVED = 'proposal-moved',
  SERVER_ACCESS_REVOKED = 'server-access-revoked',
  CALL_MODERATED = 'call-moderated',
}
