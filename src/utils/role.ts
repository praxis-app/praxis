import Messages from "./messages";
import { ModelNames } from "../constants/common";
import { GlobalPermissions, GroupPermissions } from "../constants/role";

export const permissionDescription = (name: string) => {
  const descriptions = Messages.roles.permissions.descriptions;

  switch (name) {
    case GlobalPermissions.CreateInvites:
      return descriptions.createInvites();
    case GlobalPermissions.ManageInvites:
      return descriptions.createInvites();
    case GlobalPermissions.ManageComments:
    case GroupPermissions.ManageComments:
      return descriptions.manageItems(ModelNames.Comment);
    case GlobalPermissions.ManagePosts:
    case GroupPermissions.ManagePosts:
      return descriptions.manageItems(ModelNames.Post);
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
  }
};
