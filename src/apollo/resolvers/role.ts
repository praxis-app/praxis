import prisma from "../../utils/initPrisma";
import Messages from "../../utils/messages";
import { ModelNames, TypeNames } from "../../constants/common";
import {
  ADMIN_ROLE_NAME,
  DEFAULT_ROLE_COLOR,
  Permissions,
} from "../../constants/role";

interface RoleInput {
  name: string;
  color: string;
}

interface InitialPermission {
  name: string;
  description: string;
  enabled: boolean;
}

const initialPermissions = (isAdmin = false): InitialPermission[] => [
  {
    name: Permissions.ManagePosts,
    description: Messages.roles.permissions.descriptions.manageItems(
      ModelNames.Post
    ),
    enabled: isAdmin,
  },
  {
    name: Permissions.ManageComments,
    description: Messages.roles.permissions.descriptions.manageItems(
      ModelNames.Comment
    ),
    enabled: isAdmin,
  },
  {
    name: Permissions.ManageUsers,
    description: Messages.roles.permissions.descriptions.manageUsers(),
    enabled: isAdmin,
  },
  {
    name: Permissions.ManageRoles,
    description: Messages.roles.permissions.descriptions.manageRoles(),
    enabled: isAdmin,
  },
  {
    name: Permissions.ManageInvites,
    description: Messages.roles.permissions.descriptions.manageInvites(),
    enabled: isAdmin,
  },
  {
    name: Permissions.CreateInvites,
    description: Messages.roles.permissions.descriptions.createInvites(),
    enabled: isAdmin,
  },
];

const initializePermissions = async (
  permissions: InitialPermission[],
  role: BackendRole
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

const roleResolvers = {
  Query: {
    role: async (_: any, { id }: { id: string }) => {
      const role = await prisma.role.findFirst({
        where: {
          id: parseInt(id),
        },
      });
      return role;
    },

    rolesByGroupId: async (_: any, { groupId }: { groupId: string }) => {
      const roles = await prisma.role.findMany({
        where: { groupId: parseInt(groupId) },
      });
      return roles;
    },

    globalRoles: async () => {
      const roles = await prisma.role.findMany({
        where: { global: true },
      });
      return roles;
    },
  },

  Mutation: {
    async createRole(
      _: any,
      {
        groupId,
        global,
        input,
      }: {
        groupId: string;
        global: boolean;
        input: RoleInput;
      }
    ) {
      const { name, color } = input;
      const groupConnect = groupId
        ? {
            group: {
              connect: {
                id: parseInt(groupId),
              },
            },
          }
        : undefined;
      const role = await prisma.role.create({
        data: {
          ...groupConnect,
          name,
          color,
          global,
        },
      });
      initializePermissions(initialPermissions(), role);
      return { role };
    },

    async updateRole(_: any, { id, input }: { id: string; input: RoleInput }) {
      const { name, color } = input;
      const role = await prisma.role.update({
        where: { id: parseInt(id) },
        data: { name, color },
      });

      if (!role) throw new Error(Messages.items.notFound(TypeNames.Role));

      return { role };
    },

    async deleteRole(_: any, { id }: { id: string }) {
      const whereRoleId = {
        where: {
          roleId: parseInt(id),
        },
      };
      const models: any[] = [prisma.roleMember, prisma.permission];
      for (const model of models) {
        await model.deleteMany(whereRoleId);
      }
      await prisma.role.delete({
        where: { id: parseInt(id) },
      });
      return true;
    },

    async initializeAdminRole(_: any, { userId }: { userId: string }) {
      const roles = await prisma.role.findMany({
        where: {
          global: true,
        },
      });
      if (roles.length > 0) throw Error(Messages.errors.somethingWrong());

      const role = await prisma.role.create({
        data: {
          name: ADMIN_ROLE_NAME,
          color: DEFAULT_ROLE_COLOR,
          global: true,
        },
      });
      initializePermissions(initialPermissions(true), role);
      await prisma.roleMember.create({
        data: {
          user: {
            connect: {
              id: parseInt(userId),
            },
          },
          role: {
            connect: {
              id: role.id,
            },
          },
        },
      });

      return { role };
    },
  },
};

export default roleResolvers;
