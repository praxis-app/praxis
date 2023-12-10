import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { ProposalActionFragmentDoc } from './ProposalAction.gen';
import { UserAvatarFragmentDoc } from '../../../users/fragments/gen/UserAvatar.gen';
import { AttachedImageFragmentDoc } from '../../../images/fragments/gen/AttachedImage.gen';
import { GroupAvatarFragmentDoc } from '../../../groups/fragments/gen/GroupAvatar.gen';
import { VoteMenuFragmentDoc } from '../../../votes/fragments/gen/VoteMenu.gen';
import { VoteBadgesFragmentDoc } from '../../../votes/fragments/gen/VoteBadges.gen';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type ProposalCardFragment = {
  __typename?: 'Proposal';
  id: number;
  body?: string | null;
  stage: string;
  voteCount: number;
  commentCount: number;
  createdAt: any;
  action: {
    __typename?: 'ProposalAction';
    id: number;
    actionType: string;
    groupDescription?: string | null;
    groupName?: string | null;
    groupSettings?: {
      __typename?: 'ProposalActionGroupConfig';
      id: number;
      decisionMakingModel?: string | null;
      ratificationThreshold?: number | null;
      reservationsLimit?: number | null;
      standAsidesLimit?: number | null;
      votingTimeLimit?: number | null;
      privacy?: string | null;
      oldDecisionMakingModel?: string | null;
      oldRatificationThreshold?: number | null;
      oldReservationsLimit?: number | null;
      oldStandAsidesLimit?: number | null;
      oldVotingTimeLimit?: number | null;
      oldPrivacy?: string | null;
      proposalAction: {
        __typename?: 'ProposalAction';
        id: number;
        proposal: {
          __typename?: 'Proposal';
          id: number;
          group?: {
            __typename?: 'Group';
            id: number;
            settings: {
              __typename?: 'GroupConfig';
              id: number;
              decisionMakingModel: string;
              ratificationThreshold: number;
              reservationsLimit: number;
              standAsidesLimit: number;
              votingTimeLimit: number;
              privacy: string;
            };
          } | null;
        };
      };
    } | null;
    event?: {
      __typename?: 'ProposalActionEvent';
      id: number;
      name: string;
      description: string;
      location?: string | null;
      online: boolean;
      startsAt: any;
      endsAt?: any | null;
      externalLink?: string | null;
      coverPhoto?: { __typename?: 'Image'; id: number } | null;
      host: {
        __typename?: 'User';
        id: number;
        name: string;
        profilePicture: { __typename?: 'Image'; id: number };
      };
      proposalAction: {
        __typename?: 'ProposalAction';
        id: number;
        proposal: {
          __typename?: 'Proposal';
          id: number;
          group?: { __typename?: 'Group'; id: number; name: string } | null;
        };
      };
    } | null;
    role?: {
      __typename?: 'ProposalActionRole';
      id: number;
      name?: string | null;
      color?: string | null;
      oldName?: string | null;
      oldColor?: string | null;
      permissions: {
        __typename?: 'ProposalActionPermission';
        id: number;
        approveMemberRequests?: boolean | null;
        createEvents?: boolean | null;
        deleteGroup?: boolean | null;
        manageComments?: boolean | null;
        manageEvents?: boolean | null;
        managePosts?: boolean | null;
        manageRoles?: boolean | null;
        manageSettings?: boolean | null;
        removeMembers?: boolean | null;
        updateGroup?: boolean | null;
      };
      members?: Array<{
        __typename?: 'ProposalActionRoleMember';
        id: number;
        changeType: string;
        user: {
          __typename?: 'User';
          id: number;
          name: string;
          profilePicture: { __typename?: 'Image'; id: number };
        };
      }> | null;
      groupRole?: {
        __typename?: 'GroupRole';
        id: number;
        name: string;
        color: string;
      } | null;
    } | null;
    groupCoverPhoto?: {
      __typename?: 'Image';
      id: number;
      filename: string;
    } | null;
  };
  settings: {
    __typename?: 'ProposalConfig';
    id: number;
    votingEndsAt?: any | null;
    decisionMakingModel: string;
  };
  user: {
    __typename?: 'User';
    id: number;
    name: string;
    profilePicture: { __typename?: 'Image'; id: number };
  };
  group?: {
    __typename?: 'Group';
    id: number;
    isJoinedByMe?: boolean;
    name: string;
    myPermissions?: {
      __typename?: 'GroupPermissions';
      manageComments: boolean;
    };
    coverPhoto?: { __typename?: 'Image'; id: number } | null;
  } | null;
  images: Array<{ __typename?: 'Image'; id: number; filename: string }>;
  votes: Array<{
    __typename?: 'Vote';
    id: number;
    voteType: string;
    user: {
      __typename?: 'User';
      id: number;
      name: string;
      profilePicture: { __typename?: 'Image'; id: number };
    };
  }>;
};

export const ProposalCardFragmentDoc = gql`
  fragment ProposalCard on Proposal {
    id
    body
    stage
    voteCount
    commentCount
    createdAt
    action {
      ...ProposalAction
    }
    settings {
      id
      votingEndsAt
      decisionMakingModel
    }
    user {
      ...UserAvatar
    }
    group {
      id
      isJoinedByMe @include(if: $isLoggedIn)
      myPermissions @include(if: $isLoggedIn) {
        manageComments
      }
      ...GroupAvatar
    }
    images {
      ...AttachedImage
    }
    votes {
      user {
        id
      }
    }
    ...VoteMenu
    ...VoteBadges
  }
  ${ProposalActionFragmentDoc}
  ${UserAvatarFragmentDoc}
  ${GroupAvatarFragmentDoc}
  ${AttachedImageFragmentDoc}
  ${VoteMenuFragmentDoc}
  ${VoteBadgesFragmentDoc}
`;
