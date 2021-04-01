import { gql } from "@apollo/client";

export const UPLOAD_IMAGE = gql`
  mutation UploadImageMutation($image: FileUpload!, $userId: ID!) {
    uploadImage(image: $image, userId: $userId) {
      image {
        id
        path
      }
    }
  }
`;

export const DELETE_IMAGE = gql`
  mutation DeleteImageMutation($id: ID!) {
    deleteImage(id: $id)
  }
`;
