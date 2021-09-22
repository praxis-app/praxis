import { GraphQLUpload } from "apollo-server-micro";
import prisma from "../../utils/initPrisma";
import Messages from "../../utils/messages";
import { TypeNames } from "../../constants/common";
import { Permission, Role } from ".prisma/client";

interface PermissionInput {
  permissions: ClientPermission[];
}

const permissionResolvers = {
  FileUpload: GraphQLUpload,

  Query: {
    hasPermissionGlobally: async (
      _: any,
      { name, userId }: { name: string; userId: string }
    ) => {
      const roleMembersWithRole = await prisma.roleMember.findMany({
        where: {
          userId: parseInt(userId),
        },
        include: {
          role: true,
        },
      });
      const globalRoles: Role[] = [];
      for (const member of roleMembersWithRole) {
        if (member.role?.global) {
          globalRoles.push(member.role);
        }
      }
      const permissions: Permission[] = [];
      for (const role of globalRoles) {
        const _permissions = await prisma.permission.findMany({
          where: {
            roleId: role.id,
          },
        });
        permissions.push(
          ..._permissions.filter((_permission) => {
            return !permissions.find(
              (permission) => _permission.id === permission.id
            );
          })
        );
      }
      const hasPermissionGlobally = permissions.find(
        (permission) => permission.name === name && permission.enabled
      );
      return Boolean(hasPermissionGlobally);
    },

    hasPermissionByGroupId: async (
      _: any,
      {
        name,
        userId,
        groupId,
      }: { name: string; userId: string; groupId: string }
    ) => {
      const roleMembersWithRole = await prisma.roleMember.findMany({
        where: {
          userId: parseInt(userId),
        },
        include: {
          role: true,
        },
      });
      const groupRoles: Role[] = [];
      for (const member of roleMembersWithRole) {
        if (member.role?.groupId === parseInt(groupId)) {
          groupRoles.push(member.role);
        }
      }
      const permissions: Permission[] = [];
      for (const role of groupRoles) {
        const _permissions = await prisma.permission.findMany({
          where: {
            roleId: role.id,
          },
        });
        permissions.push(
          ..._permissions.filter((_permission) => {
            return !permissions.find(
              (permission) => _permission.id === permission.id
            );
          })
        );
      }
      const hasPermission = permissions.find(
        (permission) => permission.name === name && permission.enabled
      );
      return Boolean(hasPermission);
    },

    permissionsByRoleId: async (_: any, { roleId }: { roleId: string }) => {
      const permissions = await prisma.permission.findMany({
        where: {
          roleId: parseInt(roleId),
        },
      });
      return permissions;
    },
  },

  Mutation: {
    async updatePermissions(_: any, { input }: { input: PermissionInput }) {
      const { permissions } = input;
      let updatedPermissions: Permission[] = [];

      for (const permission of permissions) {
        const { id, enabled } = permission;
        const updatedPermission = await prisma.permission.update({
          where: { id: parseInt(id) },
          data: { enabled },
        });

        if (!updatedPermission)
          throw new Error(Messages.items.notFound(TypeNames.Permission));

        updatedPermissions = [...updatedPermissions, updatedPermission];
      }

      return { permissions: updatedPermissions };
    },
  },
};

export default permissionResolvers;
