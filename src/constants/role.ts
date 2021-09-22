export const DEFAULT_ROLE_COLOR = "#f44336";
export const ADMIN_ROLE_NAME = "admin";

export enum GlobalPermissions {
  ManageUsers = "manage-users",
  ManagePosts = "manage-posts",
  ManageComments = "manage-comments",
  ManageRoles = "manage-roles",
  ManageInvites = "manage-invites",
  CreateInvites = "create-invites",
}

export enum GroupPermissions {
  EditGroup = "edit-group",
  DeleteGroup = "delete-group",
  ManagePosts = "manage-group-posts",
  ManageComments = "manage-group-comments",
  AcceptMemberRequests = "accept-group-member-requests",
  KickMembers = "kick-group-members",
  ManageRoles = "manage-group-roles",
  ManageSettings = "manage-group-settings",
}
