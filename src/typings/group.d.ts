interface Group {
  id: string;
  name: string;
  description: string;
  creatorId: string;
}

interface BackendGroup {
  id: number;
  name: string;
  description: string;
  creatorId: number;
  createdAt: Date;
  __typename?: string;
}

interface MemberRequest {
  id: string;
  userId: string;
  groupId: string;
  status: string;
  createdAt: string;
}

interface GroupMember {
  id: string;
  userId: string;
  groupId: string;
  createdAt: string;
}
