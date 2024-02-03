import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { UserAvatarFragmentDoc } from '../../../users/fragments/gen/UserAvatar.gen';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type QuestionnaireTicketCardFragment = {
  __typename?: 'QuestionnaireTicket';
  id: number;
  status: string;
  voteCount: number;
  commentCount: number;
  createdAt: any;
  user: {
    __typename?: 'User';
    id: number;
    name: string;
    profilePicture: { __typename?: 'Image'; id: number };
  };
  myVote?: { __typename?: 'Vote'; id: number } | null;
};

export const QuestionnaireTicketCardFragmentDoc = gql`
  fragment QuestionnaireTicketCard on QuestionnaireTicket {
    id
    status
    voteCount
    commentCount
    createdAt
    user {
      ...UserAvatar
    }
    myVote {
      id
    }
  }
  ${UserAvatarFragmentDoc}
`;
