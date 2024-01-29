import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { QuestionnaireTicketEntryFragmentDoc } from './QuestionnaireTicketEntry.gen';
import { UserAvatarFragmentDoc } from '../../../users/fragments/gen/UserAvatar.gen';
import { VoteFragmentDoc } from '../../../votes/fragments/gen/Vote.gen';
import { AnsweredQuestionFragmentDoc } from './AnsweredQuestion.gen';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type QuestionnaireTicketFragment = {
  __typename?: 'QuestionnaireTicket';
  id: number;
  status: string;
  createdAt: any;
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
    ...QuestionnaireTicketEntry
    questions {
      ...AnsweredQuestion
    }
    user {
      ...UserAvatar
    }
    votes {
      ...Vote
    }
  }
  ${QuestionnaireTicketEntryFragmentDoc}
  ${AnsweredQuestionFragmentDoc}
  ${UserAvatarFragmentDoc}
  ${VoteFragmentDoc}
`;
