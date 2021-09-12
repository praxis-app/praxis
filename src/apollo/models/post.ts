import { Post } from ".prisma/client";

export interface BackendPost extends Post {
  __typename?: string;
}
