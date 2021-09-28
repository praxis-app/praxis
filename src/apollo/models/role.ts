import { Role, Group } from "@prisma/client";
import {
  ADMIN_ROLE_NAME,
  DEFAULT_ROLE_COLOR,
  INITIAL_GROUP_ADMIN_PERMISSIONS,
} from "../../constants/role";
import prisma from "../../utils/initPrisma";

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
  initializePermissions(INITIAL_GROUP_ADMIN_PERMISSIONS, adminRole);
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
