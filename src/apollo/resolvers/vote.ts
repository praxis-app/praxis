import { GraphQLUpload } from "apollo-server-micro";
import prisma from "../../utils/initPrisma";
import { Motions, Votes, Settings } from "../../constants";

interface VoteInput {
  body: string;
  flipState: string;
}

const evaluateMotion = async (motionId: number): Promise<boolean> => {
  const motion = await prisma.motion.findFirst({
    where: { id: motionId },
    include: {
      votes: true,
      group: true,
    },
  });
  if (motion && motion.group) {
    const group = await prisma.group.findFirst({
      where: { id: motion.group.id },
      include: {
        members: true,
        settings: true,
      },
    });
    const groupMembers = group?.members || [];
    const groupSettings = group?.settings || [];
    const votingType = settingByName(
      groupSettings,
      Settings.GroupSettings.VotingType
    );
    const ratificationThreshold =
      parseInt(
        settingByName(
          groupSettings,
          Settings.GroupSettings.RatificationThreshold
        )
      ) * 0.01;
    const upVotes = motion?.votes.filter(
      (vote) => vote.flipState === Votes.FlipStates.Up
    );
    const downVotes = motion?.votes.filter(
      (vote) => vote.flipState === Votes.FlipStates.Down
    );

    if (
      votingType === Votes.VotingTypes.Consensus &&
      motion.stage === Motions.Stages.Voting &&
      downVotes.length === 0 &&
      groupMembers.length >= 3 &&
      upVotes.length >= groupMembers.length * ratificationThreshold
    ) {
      ratifyMotion(motionId);
      return true;
    }
  }
  return false;
};

const ratifyMotion = async (motionId: number) => {
  const motion = await prisma.motion.update({
    where: { id: motionId },
    data: {
      stage: Motions.Stages.Ratified,
    },
  });
  doAction(motion);
};

const doAction = async (motion: BackendMotion) => {
  if (motion && motion.action) {
    const actionData = motion.actionData as ActionData;
    const groupId = { id: motion.groupId as number };
    const whereGroupId = {
      where: {
        ...groupId,
      },
    };

    if (motion.action === Motions.ActionTypes.ChangeName) {
      await prisma.group.update({
        ...whereGroupId,
        data: {
          name: actionData.newGroupName,
        },
      });
    }

    if (motion.action === Motions.ActionTypes.ChangeDescription) {
      await prisma.group.update({
        ...whereGroupId,
        data: {
          description: actionData.newGroupDescription,
        },
      });
    }

    if (motion.action === Motions.ActionTypes.ChangeImage) {
      const path = actionData.newGroupImagePath as string;
      await prisma.image.create({
        data: {
          group: {
            connect: {
              ...groupId,
            },
          },
          profilePicture: true,
          path,
        },
      });
    }
  }
};

const settingByName = (
  settings: BackendSetting[],
  name: Settings.GroupSettings
): string => {
  const setting = settings.find((setting) => setting.name === name);
  return setting?.value as string;
};

const voteResolvers = {
  FileUpload: GraphQLUpload,

  Query: {
    vote: async (_: any, { id }: { id: string }) => {
      try {
        const vote = await prisma.vote.findFirst({
          where: {
            id: parseInt(id),
          },
        });
        return vote;
      } catch (error) {
        throw error;
      }
    },

    votesByMotionId: async (_: any, { motionId }: { motionId: string }) => {
      try {
        const votes = await prisma.vote.findMany({
          where: { motionId: parseInt(motionId) },
        });
        return votes;
      } catch (error) {
        throw error;
      }
    },
  },

  Mutation: {
    async createVote(
      _: any,
      {
        userId,
        motionId,
        input,
      }: {
        userId: string;
        motionId: string;
        input: VoteInput;
      }
    ) {
      const { body, flipState } = input;
      try {
        const vote = await prisma.vote.create({
          data: {
            user: {
              connect: {
                id: parseInt(userId),
              },
            },
            motion: {
              connect: {
                id: parseInt(motionId),
              },
            },
            body,
            flipState,
          },
        });

        const motionRatified = evaluateMotion(parseInt(motionId));

        return { vote, motionRatified };
      } catch (err) {
        throw new Error(err);
      }
    },

    async updateVote(_: any, { id, input }: { id: string; input: VoteInput }) {
      const { body, flipState } = input;

      try {
        const vote = await prisma.vote.update({
          where: { id: parseInt(id) },
          data: { body, flipState },
        });

        if (!vote) throw new Error("Vote not found.");

        const motionRatified = evaluateMotion(vote.motionId as number);

        return { vote, motionRatified };
      } catch (err) {
        throw new Error(err);
      }
    },

    async verifyVote(_: any, { id }: { id: string }) {
      try {
        const vote = await prisma.vote.update({
          where: { id: parseInt(id) },
          data: { verified: true },
        });

        if (!vote) throw new Error("Vote not found.");

        return { vote };
      } catch (err) {
        throw new Error(err);
      }
    },

    async deleteVote(_: any, { id }: { id: string }) {
      try {
        await prisma.vote.delete({
          where: { id: parseInt(id) },
        });

        return true;
      } catch (err) {
        throw new Error(err);
      }
    },
  },
};

export default voteResolvers;
