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
