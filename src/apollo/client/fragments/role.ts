import { gql } from "@apollo/client";

export const ROLE_SUMMARY = gql`
  fragment RoleSummary on Role {
    id
    name
    color
    groupId
    createdAt
  }
`;
