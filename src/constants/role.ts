export const DEFAULT_ROLE_COLOR = "#f44336";
export const ADMIN_ROLE_NAME = "admin";

export enum GlobalPermissions {
  ManageEvents = "manage-events",
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
  ManageEvents = "manage-group-events",
  CreateEvents = "create-group-events",
}

export const INITIAL_GLOBAL_PERMISSIONS: InitialPermission[] = [
  GlobalPermissions.ManagePosts,
  GlobalPermissions.ManageComments,
  GlobalPermissions.ManageUsers,
  GlobalPermissions.ManageRoles,
  GlobalPermissions.ManageInvites,
  GlobalPermissions.CreateInvites,
  GlobalPermissions.ManageEvents,
].map((name) => {
  return { name, enabled: false };
});

export const INITIAL_GROUP_PERMISSIONS: InitialPermission[] = [
  GroupPermissions.ManagePosts,
  GroupPermissions.ManageComments,
  GroupPermissions.AcceptMemberRequests,
  GroupPermissions.KickMembers,
  GroupPermissions.CreateEvents,
  GroupPermissions.ManageEvents,
  GroupPermissions.ManageRoles,
  GroupPermissions.ManageSettings,
  GroupPermissions.EditGroup,
  GroupPermissions.DeleteGroup,
].map((name) => {
  return { name, enabled: false };
});

export const INITIAL_GLOBAL_ADMIN_PERMISSIONS: InitialPermission[] =
  INITIAL_GLOBAL_PERMISSIONS.map((permission) => {
    return { ...permission, enabled: true };
  });

export const INITIAL_GROUP_ADMIN_PERMISSIONS: InitialPermission[] =
  INITIAL_GROUP_PERMISSIONS.map((permission) => {
    return { ...permission, enabled: true };
  });
