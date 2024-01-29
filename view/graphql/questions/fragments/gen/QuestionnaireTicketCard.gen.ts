import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { UserAvatarFragmentDoc } from '../../../users/fragments/gen/UserAvatar.gen';
import { VoteFragmentDoc } from '../../../votes/fragments/gen/Vote.gen';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type QuestionnaireTicketCardFragment = {
  __typename?: 'QuestionnaireTicket';
  id: number;
  status: string;
  createdAt: any;
  user: {
    __typename?: 'User';
    id: number;
    name: string;
    profilePicture: { __typename?: 'Image'; id: number };
  };
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

export const QuestionnaireTicketCardFragmentDoc = gql`
  fragment QuestionnaireTicketCard on QuestionnaireTicket {
    id
    status
    createdAt
    user {
      ...UserAvatar
    }
    votes {
      ...Vote
    }
  }
  ${UserAvatarFragmentDoc}
  ${VoteFragmentDoc}
`;
