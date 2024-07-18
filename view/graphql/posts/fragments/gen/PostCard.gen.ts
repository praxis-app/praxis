import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { AttachedImageFragmentDoc } from '../../../images/fragments/gen/AttachedImage.gen';
import { UserAvatarFragmentDoc } from '../../../users/fragments/gen/UserAvatar.gen';
import { GroupAvatarFragmentDoc } from '../../../groups/fragments/gen/GroupAvatar.gen';
import { GroupPermissionsFragmentDoc } from '../../../groups/fragments/gen/GroupPermissions.gen';
import { EventAvatarFragmentDoc } from '../../../events/fragments/gen/EventAvatar.gen';
import { SharedPostFragmentDoc } from './SharedPost.gen';
import { SharedProposalFragmentDoc } from '../../../proposals/fragments/gen/SharedProposal.gen';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type PostCardFragment = {
  __typename?: 'Post';
  id: number;
  body?: string | null;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  isLikedByMe?: boolean;
  hasMissingSharedProposal: boolean;
  hasMissingSharedPost: boolean;
  createdAt: any;
  images: Array<{ __typename?: 'Image'; id: number; filename: string }>;
  user: {
    __typename?: 'User';
    id: number;
    name: string;
    displayName?: string | null;
    profilePicture: { __typename?: 'Image'; id: number };
  };
  group?: {
    __typename?: 'Group';
    isJoinedByMe?: boolean;
    id: number;
    name: string;
    myPermissions?: {
      __typename?: 'GroupPermissions';
      approveMemberRequests: boolean;
      createEvents: boolean;
      deleteGroup: boolean;
      manageComments: boolean;
      manageEvents: boolean;
      managePosts: boolean;
      manageRoles: boolean;
      manageSettings: boolean;
      removeMembers: boolean;
      updateGroup: boolean;
    };
    coverPhoto?: { __typename?: 'Image'; id: number } | null;
  } | null;
  event?: {
    __typename?: 'Event';
    id: number;
    name: string;
    group?: { __typename?: 'Group'; id: number; isJoinedByMe: boolean } | null;
    coverPhoto: { __typename?: 'Image'; id: number };
  } | null;
  sharedPost?: {
    __typename?: 'Post';
    id: number;
    body?: string | null;
    createdAt: any;
    images: Array<{ __typename?: 'Image'; id: number; filename: string }>;
    user: {
      __typename?: 'User';
      id: number;
      name: string;
      displayName?: string | null;
      profilePicture: { __typename?: 'Image'; id: number };
    };
  } | null;
  sharedProposal?: {
    __typename?: 'Proposal';
    id: number;
    body?: string | null;
    stage: Types.ProposalStage;
    createdAt: any;
    action: {
      __typename?: 'ProposalAction';
      id: number;
      actionType: Types.ProposalActionType;
      groupDescription?: string | null;
      groupName?: string | null;
      groupSettings?: {
        __typename?: 'ProposalActionGroupConfig';
        id: number;
        adminModel?: string | null;
        decisionMakingModel?: Types.DecisionMakingModel | null;
        ratificationThreshold?: number | null;
        reservationsLimit?: number | null;
        standAsidesLimit?: number | null;
        votingTimeLimit?: number | null;
        privacy?: string | null;
        oldAdminModel?: string | null;
        oldDecisionMakingModel?: Types.DecisionMakingModel | null;
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
                adminModel: string;
                decisionMakingModel: Types.DecisionMakingModel;
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
          displayName?: string | null;
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
            displayName?: string | null;
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
    images: Array<{ __typename?: 'Image'; id: number; filename: string }>;
    user: {
      __typename?: 'User';
      id: number;
      name: string;
      displayName?: string | null;
      profilePicture: { __typename?: 'Image'; id: number };
    };
  } | null;
};

export const PostCardFragmentDoc = gql`
  fragment PostCard on Post {
    id
    body
    likeCount
    commentCount
    shareCount
    isLikedByMe @include(if: $isVerified)
    hasMissingSharedProposal
    hasMissingSharedPost
    createdAt
    images {
      ...AttachedImage
    }
    user {
      ...UserAvatar
    }
    group {
      ...GroupAvatar
      myPermissions @include(if: $isVerified) {
        ...GroupPermissions
      }
      isJoinedByMe @include(if: $isVerified)
    }
    event {
      ...EventAvatar
      group @include(if: $isVerified) {
        id
        isJoinedByMe
      }
    }
    sharedPost {
      ...SharedPost
    }
    sharedProposal {
      ...SharedProposal
    }
  }
  ${AttachedImageFragmentDoc}
  ${UserAvatarFragmentDoc}
  ${GroupAvatarFragmentDoc}
  ${GroupPermissionsFragmentDoc}
  ${EventAvatarFragmentDoc}
  ${SharedPostFragmentDoc}
  ${SharedProposalFragmentDoc}
`;
