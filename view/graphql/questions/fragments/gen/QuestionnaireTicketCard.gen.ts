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
  answerCount: number;
  commentCount: number;
  questionCount: number;
  voteCount: number;
  votesNeededToVerify: number;
  agreementVoteCount: number;
  createdAt: any;
  user: {
    __typename?: 'User';
    id: number;
    name: string;
    displayName?: string | null;
    profilePicture: { __typename?: 'Image'; id: number };
  };
  settings: {
    __typename?: 'QuestionnaireTicketConfig';
    id: number;
    closingAt?: any | null;
    decisionMakingModel: Types.DecisionMakingModel;
    verificationThreshold: number;
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
      displayName?: string | null;
      profilePicture: { __typename?: 'Image'; id: number };
    };
  }>;
};

export const QuestionnaireTicketCardFragmentDoc = gql`
  fragment QuestionnaireTicketCard on QuestionnaireTicket {
    id
    status
    answerCount
    commentCount
    questionCount
    voteCount
    votesNeededToVerify
    agreementVoteCount
    createdAt
    user {
      ...UserAvatar
    }
    settings {
      id
      closingAt
      decisionMakingModel
      verificationThreshold
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
