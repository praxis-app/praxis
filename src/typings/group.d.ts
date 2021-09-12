interface ClientGroup {
  id: string;
  name: string;
  description: string;
  creatorId: string;
}

interface ClientMemberRequest {
  id: string;
  userId: string;
  groupId: string;
  status: string;
  createdAt: string;
}

interface ClientGroupMember {
  id: string;
  userId: string;
  groupId: string;
  createdAt: string;
}
