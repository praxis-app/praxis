import { gql } from "@apollo/client";

export const DELETE_IMAGE = gql`
  mutation DeleteImageMutation($id: ID!) {
    deleteImage(id: $id)
  }
`;
