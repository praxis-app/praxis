import * as Types from '../../gen';

import { gql } from '@apollo/client';
import { ProposalActionFragmentDoc } from './ProposalAction.fragment';
import { UserAvatarFragmentDoc } from '../../users/generated/UserAvatar.fragment';
import { AttachedImageFragmentDoc } from '../../images/generated/AttachedImage.fragment';
import { GroupAvatarFragmentDoc } from '../../groups/generated/GroupAvatar.fragment';
import { VoteMenuFragmentDoc } from '../../votes/generated/VoteMenu.fragment';
import { VoteBadgesFragmentDoc } from '../../votes/generated/VoteBadges.fragment';

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
