export enum NotificationStatus {
  Read = 'read',
  Unread = 'unread',
}

export enum NotificationActionType {
  CommentLike = 'comment-like',
  PostLike = 'post-like',
  PostComment = 'post-comment',
  ProposalComment = 'proposal-comment',
  ProposalRatified = 'proposal-ratified',
  ProposalVoteAgreement = 'proposal-vote-agreement',
  ProposalVoteReservations = 'proposal-vote-reservations',
  ProposalVoteStandAside = 'proposal-vote-stand-aside',
  ProposalVoteBlock = 'proposal-vote-block',
}
