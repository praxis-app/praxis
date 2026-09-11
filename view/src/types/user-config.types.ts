export interface UserConfigReq {
  messageNotificationsEnabled?: boolean;
  replyNotificationsEnabled?: boolean;
  proposalNotificationsEnabled?: boolean;
  roleNotificationsEnabled?: boolean;
}

export interface UserConfigRes {
  messageNotificationsEnabled: boolean;
  replyNotificationsEnabled: boolean;
  proposalNotificationsEnabled: boolean;
  roleNotificationsEnabled: boolean;
  updatedAt: string;
}
