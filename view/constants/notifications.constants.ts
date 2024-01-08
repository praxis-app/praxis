export enum NotificationStatus {
  Read = 'read',
  Unread = 'unread',
}

export enum NotificationType {
  CommentLike = 'comment-like',
  GroupMemberRequest = 'group-member-request',
  GroupMemberRequestApproval = 'group-member-request-approval',
  PostComment = 'post-comment',
  PostLike = 'post-like',
  ProposalComment = 'proposal-comment',
  ProposalRatification = 'proposal-ratification',
  ProposalVoteAgreement = 'proposal-vote-agreement',
  ProposalVoteBlock = 'proposal-vote-block',
  ProposalVoteReservations = 'proposal-vote-reservations',
  ProposalVoteStandAside = 'proposal-vote-stand-aside',
}
