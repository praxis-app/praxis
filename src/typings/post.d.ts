interface Post {
  id: string;
  userId: string;
  groupId: string;
  postGroupId?: string;
  body: string;
  createdAt: string;
  __typename: string;
}

interface BackendPost {
  id: number;
  userId: number | null;
  groupId: number | null;
  body: string | null;
  createdAt: Date;
  __typename?: string;
}
