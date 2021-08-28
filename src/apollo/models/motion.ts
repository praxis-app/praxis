import prisma from "../../utils/initPrisma";
import { ConsensusStates, VotingTypes } from "../../constants/vote";
import { ActionTypes, Stages } from "../../constants/motion";
import { GroupSettings } from "../../constants/setting";
import { groupSettingByName } from "./setting";

const evaluate = async (motionId: number): Promise<boolean> => {
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
    const votingType = groupSettingByName(
      groupSettings,
      GroupSettings.VotingType
    );
    const reservationsLimit = parseInt(
      groupSettingByName(groupSettings, GroupSettings.ReservationsLimit)
    );
    const standAsidesLimit = parseInt(
      groupSettingByName(groupSettings, GroupSettings.StandAsidesLimit)
    );
    const ratificationThreshold =
      parseInt(
        groupSettingByName(groupSettings, GroupSettings.RatificationThreshold)
      ) * 0.01;
    const agreements = motion?.votes.filter(
      (vote) => vote.consensusState === ConsensusStates.Agreement
    );
    const reservations = motion?.votes.filter(
      (vote) => vote.consensusState === ConsensusStates.Reservations
    );
    const standAsides = motion?.votes.filter(
      (vote) => vote.consensusState === ConsensusStates.StandAside
    );
    const blocks = motion?.votes.filter(
      (vote) => vote.consensusState === ConsensusStates.Block
    );
    if (
      groupMembers.length >= 3 &&
      motion.stage === Stages.Voting &&
      votingType === VotingTypes.Consensus &&
      agreements.length >= groupMembers.length * ratificationThreshold &&
      reservations.length <= reservationsLimit &&
      standAsides.length <= standAsidesLimit &&
      blocks.length === 0
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
      stage: Stages.Ratified,
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

    if (motion.action === ActionTypes.ChangeName) {
      await prisma.group.update({
        ...whereGroupId,
        data: {
          name: actionData.newGroupName,
        },
      });
    }

    if (motion.action === ActionTypes.ChangeDescription) {
      await prisma.group.update({
        ...whereGroupId,
        data: {
          description: actionData.newGroupDescription,
        },
      });
    }

    if (motion.action === ActionTypes.ChangeImage) {
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

export default { evaluate };
