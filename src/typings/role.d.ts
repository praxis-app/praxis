interface ClientRole {
  id: string;
  groupId: string;
  name: string;
  color: string;
}

interface ClientPermission {
  id: string;
  roleId: string;
  name: string;
  description: string;
  enabled: boolean;
  createdAt: string;
}

interface ClientRoleMember {
  id: string;
  roleId: string;
  userId: string;
  createdAt: Date;
}
