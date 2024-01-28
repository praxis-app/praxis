import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { UserAvatarFragmentDoc } from '../../../users/fragments/gen/UserAvatar.gen';
import { VoteFragmentDoc } from '../../../votes/fragments/gen/Vote.gen';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type QuestionnaireTicketFragment = {
  __typename?: 'QuestionnaireTicket';
  id: number;
  status: string;
  questions: Array<{
    __typename?: 'Question';
    id: number;
    text: string;
    priority: number;
    answer?: { __typename?: 'Answer'; id: number; text: string } | null;
  }>;
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

export const QuestionnaireTicketFragmentDoc = gql`
  fragment QuestionnaireTicket on QuestionnaireTicket {
    id
    status
    questions {
      id
      text
      priority
      answer(questionnaireTicketId: $questionnaireTicketId) {
        id
        text
      }
    }
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
