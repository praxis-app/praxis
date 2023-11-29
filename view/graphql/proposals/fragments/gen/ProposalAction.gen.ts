import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { ProposalActionGroupSettingsFragmentDoc } from './ProposalActionGroupSettings.gen';
import { ProposalActionEventFragmentDoc } from './ProposalActionEvent.gen';
import { ProposalActionRoleFragmentDoc } from './ProposalActionRole.gen';
import { AttachedImageFragmentDoc } from '../../../images/fragments/gen/AttachedImage.gen';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type ProposalActionFragment = {
  __typename?: 'ProposalAction';
  id: number;
  actionType: string;
  groupDescription?: string | null;
  groupName?: string | null;
  groupSettings?: {
    __typename?: 'ProposalActionGroupConfig';
    id: number;
    privacy?: string | null;
    ratificationThreshold?: number | null;
    reservationsLimit?: number | null;
    standAsidesLimit?: number | null;
    oldPrivacy?: string | null;
    oldRatificationThreshold?: number | null;
    oldReservationsLimit?: number | null;
    oldStandAsidesLimit?: number | null;
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
            privacy: string;
            ratificationThreshold: number;
            reservationsLimit: number;
            standAsidesLimit: number;
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

export const ProposalActionFragmentDoc = gql`
  fragment ProposalAction on ProposalAction {
    id
    actionType
    groupDescription
    groupName
    groupSettings {
      ...ProposalActionGroupSettings
    }
    event {
      ...ProposalActionEvent
    }
    role {
      ...ProposalActionRole
    }
    groupCoverPhoto {
      ...AttachedImage
    }
  }
  ${ProposalActionGroupSettingsFragmentDoc}
  ${ProposalActionEventFragmentDoc}
  ${ProposalActionRoleFragmentDoc}
  ${AttachedImageFragmentDoc}
`;
