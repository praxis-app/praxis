export const DEFAULT_ROLE_COLOR = "#f44336";
export const ADMIN_ROLE_NAME = "admin";

export enum ServerPermission {
  BanMembers = "ban-members",
  CreateInvites = "create-invites",
  ManageComments = "manage-comments",
  ManageEvents = "manage-events",
  ManageInvites = "manage-invites",
  ManagePosts = "manage-posts",
  ManageRoles = "manage-roles",
}

export enum GroupPermission {
  ApproveMemberRequests = "approve-group-member-requests",
  BanMembers = "ban-group-members",
  CreateEvents = "create-group-events",
  DeleteGroup = "delete-group",
  UpdateGroup = "update-group",
  ManageComments = "manage-group-comments",
  ManageEvents = "manage-group-events",
  ManagePosts = "manage-group-posts",
  ManageRoles = "manage-group-roles",
  ManageSettings = "manage-group-settings",
}
