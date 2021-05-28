import { gql } from "@apollo/client";

export const GROUP_SUMMARY = gql`
  fragment GroupSummary on Group {
    id
    name
    description
    creatorId
    createdAt
  }
`;
