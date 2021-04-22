interface Motion {
  id: string;
  userId: string;
  groupId: string;
  motionGroupId?: string;
  body: string;
  action: string;
  stage: string;
  createdAt: string;
  __typename: string;
}

interface BackendMotion {
  id: number;
  userId: number | null;
  groupId: number | null;
  body: string | null;
  action: string | null;
  stage: string | null;
  createdAt: Date;
  __typename?: string;
}
