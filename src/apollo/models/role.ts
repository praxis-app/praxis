import { Role, Group } from "@prisma/client";
import { ModelNames } from "../../constants/common";
import {
  ADMIN_ROLE_NAME,
  DEFAULT_ROLE_COLOR,
  GlobalPermissions,
  GroupPermissions,
} from "../../constants/role";
import prisma from "../../utils/initPrisma";
import Messages from "../../utils/messages";

export interface InitialPermission {
  name: string;
  description: string;
  enabled: boolean;
}

export const initialGlobalPermissions = (
  isAdmin = false
): InitialPermission[] => [
  {
    name: GlobalPermissions.ManagePosts,
    description: Messages.roles.permissions.descriptions.manageItems(
      ModelNames.Post
    ),
    enabled: isAdmin,
  },
  {
    name: GlobalPermissions.ManageComments,
    description: Messages.roles.permissions.descriptions.manageItems(
      ModelNames.Comment
    ),
    enabled: isAdmin,
  },
  {
    name: GlobalPermissions.ManageUsers,
    description: Messages.roles.permissions.descriptions.manageUsers(),
    enabled: isAdmin,
  },
  {
    name: GlobalPermissions.ManageRoles,
    description: Messages.roles.permissions.descriptions.manageRoles(),
    enabled: isAdmin,
  },
  {
    name: GlobalPermissions.ManageInvites,
    description: Messages.roles.permissions.descriptions.manageInvites(),
    enabled: isAdmin,
  },
  {
    name: GlobalPermissions.CreateInvites,
    description: Messages.roles.permissions.descriptions.createInvites(),
    enabled: isAdmin,
  },
];

export const initialGroupPermissions = (
  isAdmin = false
): InitialPermission[] => [
  {
    name: GroupPermissions.ManagePosts,
    description: Messages.roles.permissions.descriptions.manageItems(
      ModelNames.Post
    ),
    enabled: isAdmin,
  },
  {
    name: GroupPermissions.ManageComments,
    description: Messages.roles.permissions.descriptions.manageItems(
      ModelNames.Comment
    ),
    enabled: isAdmin,
  },
  {
    name: GroupPermissions.AcceptMemberRequests,
    description: Messages.roles.permissions.descriptions.acceptMemberRequests(),
    enabled: isAdmin,
  },
  {
    name: GroupPermissions.KickMembers,
    description: Messages.roles.permissions.descriptions.kickGroupMembers(),
    enabled: isAdmin,
  },
  {
    name: GroupPermissions.ManageRoles,
    description: Messages.roles.permissions.descriptions.manageRoles(),
    enabled: isAdmin,
  },
  {
    name: GroupPermissions.ManageSettings,
    description: Messages.roles.permissions.descriptions.manageGroupSettings(),
    enabled: isAdmin,
  },
  {
    name: GroupPermissions.EditGroup,
    description: Messages.roles.permissions.descriptions.editGroup(),
    enabled: isAdmin,
  },
  {
    name: GroupPermissions.DeleteGroup,
    description: Messages.roles.permissions.descriptions.deleteGroup(),
    enabled: isAdmin,
  },
];

export const initializePermissions = async (
  permissions: InitialPermission[],
  role: Role
) => {
  for (const permission of permissions) {
    await prisma.permission.create({
      data: {
        ...permission,
        role: {
          connect: {
            id: role.id,
          },
        },
      },
    });
  }
};

export const initializeGroupAdminRole = async (group: Group) => {
  const adminRole = await prisma.role.create({
    data: {
      name: ADMIN_ROLE_NAME,
      color: DEFAULT_ROLE_COLOR,
      group: {
        connect: {
          id: group.id,
        },
      },
    },
  });
  initializePermissions(initialGroupPermissions(true), adminRole);
  await prisma.roleMember.create({
    data: {
      user: {
        connect: {
          id: group.creatorId,
        },
      },
      role: {
        connect: {
          id: adminRole.id,
        },
      },
    },
  });
};
