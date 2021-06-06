import prisma from "../../utils/initPrisma";

interface AddMembersInput {
  roleId: string;
  selectedUsers: SelectedUser[];
}

const roleMemberResolvers = {
  Query: {
    roleMembers: async (_: any, { roleId }: { roleId: string }) => {
      const role = await prisma.role.findFirst({
        where: {
          id: parseInt(roleId),
        },
        include: {
          members: true,
        },
      });
      return role?.members;
    },
  },

  Mutation: {
    async addRoleMembers(
      _: any,
      { roleId, input }: { roleId: string; input: AddMembersInput }
    ) {
      const { selectedUsers } = input;
      const roleMembers: BackendRoleMember[] = [];
      for (const selectedUser of selectedUsers) {
        const roleMember = await prisma.roleMember.create({
          data: {
            user: {
              connect: {
                id: parseInt(selectedUser.userId),
              },
            },
            role: {
              connect: {
                id: parseInt(roleId),
              },
            },
          },
        });
        roleMembers.push(roleMember);
      }
      return { roleMembers };
    },

    async deleteRoleMember(_: any, { id }: { id: string }) {
      await prisma.roleMember.delete({
        where: { id: parseInt(id) },
      });
      return true;
    },
  },
};

export default roleMemberResolvers;
