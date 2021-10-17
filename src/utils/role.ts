import Messages from "./messages";
import { GlobalPermissions, GroupPermissions } from "../constants/role";

export const permissionDisplayName = (name: string): string => {
  const displayNames = Messages.roles.permissions.names;
  switch (name) {
    case GlobalPermissions.CreateInvites:
      return displayNames.createInvites();
    case GlobalPermissions.ManageInvites:
      return displayNames.createInvites();
    case GlobalPermissions.ManageComments:
    case GroupPermissions.ManageComments:
      return displayNames.manageComments();
    case GlobalPermissions.ManageEvents:
    case GroupPermissions.ManageEvents:
      return displayNames.manageEvents();
    case GroupPermissions.CreateEvents:
      return displayNames.createEvents();
    case GlobalPermissions.ManagePosts:
    case GroupPermissions.ManagePosts:
      return displayNames.managePosts();
    case GlobalPermissions.ManageRoles:
      return displayNames.manageRoles();
    case GlobalPermissions.ManageUsers:
      return displayNames.manageUsers();
    case GroupPermissions.ManageRoles:
      return displayNames.manageRoles();
    case GroupPermissions.AcceptMemberRequests:
      return displayNames.acceptMemberRequests();
    case GroupPermissions.DeleteGroup:
      return displayNames.deleteGroup();
    case GroupPermissions.EditGroup:
      return displayNames.editGroup();
    case GroupPermissions.KickMembers:
      return displayNames.kickGroupMembers();
    case GroupPermissions.ManageSettings:
      return displayNames.manageSettings();
    default:
      return "";
  }
};

export const permissionDescription = (name: string): string => {
  const descriptions = Messages.roles.permissions.descriptions;
  switch (name) {
    case GlobalPermissions.CreateInvites:
      return descriptions.createInvites();
    case GlobalPermissions.ManageInvites:
      return descriptions.createInvites();
    case GlobalPermissions.ManageComments:
    case GroupPermissions.ManageComments:
      return descriptions.manageComments();
    case GlobalPermissions.ManageEvents:
    case GroupPermissions.ManageEvents:
      return descriptions.manageEvents();
    case GroupPermissions.CreateEvents:
      return descriptions.createEvents();
    case GlobalPermissions.ManagePosts:
    case GroupPermissions.ManagePosts:
      return descriptions.managePosts();
    case GlobalPermissions.ManageRoles:
    case GroupPermissions.ManageRoles:
      return descriptions.manageRoles();
    case GlobalPermissions.ManageUsers:
      return descriptions.manageUsers();
    case GroupPermissions.AcceptMemberRequests:
      return descriptions.acceptMemberRequests();
    case GroupPermissions.DeleteGroup:
      return descriptions.deleteGroup();
    case GroupPermissions.EditGroup:
      return descriptions.editGroup();
    case GroupPermissions.KickMembers:
      return descriptions.kickGroupMembers();
    case GroupPermissions.ManageSettings:
      return descriptions.manageGroupSettings();
    default:
      return "";
  }
};
