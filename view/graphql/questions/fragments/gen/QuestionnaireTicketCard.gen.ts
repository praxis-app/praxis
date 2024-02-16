import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { UserAvatarFragmentDoc } from '../../../users/fragments/gen/UserAvatar.gen';
import { QuestionnaireTicketVoteBadgesFragmentDoc } from './QuestionnaireTicketVoteBadges.gen';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type QuestionnaireTicketCardFragment = {
  __typename?: 'QuestionnaireTicket';
  id: number;
  status: string;
  voteCount: number;
  commentCount: number;
  questionCount: number;
  answerCount: number;
  createdAt: any;
  user: {
    __typename?: 'User';
    id: number;
    name: string;
    profilePicture: { __typename?: 'Image'; id: number };
  };
  settings: {
    __typename?: 'QuestionnaireTicketConfig';
    id: number;
    closingAt?: any | null;
    decisionMakingModel: string;
    ratificationThreshold: number;
    reservationsLimit: number;
    standAsidesLimit: number;
  };
  myVote?: { __typename?: 'Vote'; id: number; voteType: string } | null;
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
    voteCount
    commentCount
    questionCount
    answerCount
    createdAt
    user {
      ...UserAvatar
    }
    settings {
      id
      closingAt
      decisionMakingModel
      ratificationThreshold
      reservationsLimit
      standAsidesLimit
    }
    myVote {
      id
      voteType
    }
    ...QuestionnaireTicketVoteBadges
  }
  ${UserAvatarFragmentDoc}
  ${QuestionnaireTicketVoteBadgesFragmentDoc}
`;
