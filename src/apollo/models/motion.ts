import { Motion, Vote, Group, GroupMember, Setting } from ".prisma/client";
import prisma from "../../utils/initPrisma";
import Messages from "../../utils/messages";
import { TypeNames } from "../../constants/common";
import { GroupSettings } from "../../constants/setting";
import {
  Stages,
  ActionTypes,
  MIN_GROUP_SIZE_FOR_RATIFICATION,
} from "../../constants/motion";
import { ConsensusStates, FlipStates, VotingTypes } from "../../constants/vote";
import { groupSettingByName, updateSettingById } from "./setting";

export interface BackendMotion extends Motion {
  __typename?: string;
}

interface MotionWithVotesAndGroup extends Motion {
  votes: Vote[];
  group: Group | null;
}

export const evaluate = async (motionId: number): Promise<boolean> => {
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
    const consensus =
      votingType === VotingTypes.Consensus &&
      hasConsensus(motion, groupMembers, groupSettings);
    const majority =
      votingType === VotingTypes.Majority && hasMajority(motion, groupMembers);
    const enoughToPass =
      votingType === VotingTypes.XToPass &&
      hasEnoughToPass(motion, groupSettings);

    if (
      groupMembers.length >= MIN_GROUP_SIZE_FOR_RATIFICATION &&
      motion.stage === Stages.Voting &&
      (consensus || majority || enoughToPass)
    ) {
      ratifyMotion(motionId);
      return true;
    }
  }
  return false;
};

const hasConsensus = (
  motion: MotionWithVotesAndGroup,
  groupMembers: GroupMember[],
  groupSettings: Setting[]
): boolean => {
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

  return (
    agreements.length >= groupMembers.length * ratificationThreshold &&
    reservations.length <= reservationsLimit &&
    standAsides.length <= standAsidesLimit &&
    blocks.length === 0
  );
};

const hasMajority = (
  motion: MotionWithVotesAndGroup,
  groupMembers: GroupMember[]
): boolean => {
  const upVotes = motion?.votes.filter(
    (vote) => vote.flipState === FlipStates.Up
  );
  return upVotes.length > groupMembers.length * 0.5;
};

const hasEnoughToPass = (
  motion: MotionWithVotesAndGroup,
  groupSettings: Setting[]
): boolean => {
  const passLimit = parseInt(
    groupSettingByName(groupSettings, GroupSettings.XToPass)
  );
  const blockLimit = parseInt(
    groupSettingByName(groupSettings, GroupSettings.XToBlock)
  );
  const upVotes = motion?.votes.filter(
    (vote) => vote.flipState === FlipStates.Up
  );
  const downVotes = motion?.votes.filter(
    (vote) => vote.flipState === FlipStates.Down
  );
  return upVotes.length >= passLimit && downVotes.length < blockLimit;
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

const doAction = async (motion: Motion) => {
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
          name: actionData.groupName,
        },
      });
    }

    if (motion.action === ActionTypes.ChangeDescription) {
      await prisma.group.update({
        ...whereGroupId,
        data: {
          description: actionData.groupDescription,
        },
      });
    }

    if (motion.action === ActionTypes.ChangeImage) {
      const path = actionData.groupImagePath as string;
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

    if (
      motion.action === ActionTypes.ChangeSettings &&
      actionData.groupSettings
    ) {
      for (const setting of actionData.groupSettings) {
        const updatedSetting = await updateSettingById(setting);
        if (!updatedSetting)
          throw new Error(Messages.items.notFound(TypeNames.Setting));
      }
    }
  }
};
