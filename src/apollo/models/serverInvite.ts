import { ServerInvite } from ".prisma/client";
import prisma from "../../utils/initPrisma";

const timeDifference = (expiresAt: string | undefined) => {
  if (expiresAt)
    return { expiresAt: new Date(Date.now() + parseInt(expiresAt) * 1000) };
  return {};
};

const hasExpired = (invite: ServerInvite): boolean => {
  if (invite.expiresAt) return Number(invite.expiresAt) <= Date.now();
  if (invite.maxUses) return invite.uses >= invite.maxUses;
  return false;
};

const removeExpired = async (): Promise<ServerInvite[]> => {
  let serverInvites = await prisma.serverInvite.findMany();
  for (const invite of serverInvites)
    if (hasExpired(invite)) {
      await prisma.serverInvite.delete({
        where: {
          id: invite.id,
        },
      });
      serverInvites = serverInvites.filter((invite) => invite.id === invite.id);
    }
  return serverInvites;
};

export default { timeDifference, hasExpired, removeExpired };
