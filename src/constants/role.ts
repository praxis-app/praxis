export namespace Roles {
  export const DEFAULT_COLOR = "#f44336";
  export const ADMIN_NAME = "admin";

  export enum Permissions {
    ManageUsers = "manage-users",
    ManagePosts = "manage-posts",
    ManageComments = "manage-comments",
    ManageRoles = "manage-roles",
  }
}
