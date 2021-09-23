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
  enabled: boolean;
  createdAt: string;
}

interface ClientRoleMember {
  id: string;
  roleId: string;
  userId: string;
  createdAt: Date;
}

interface InitialPermission {
  name: string;
  enabled: boolean;
}

interface ProposedRole {
  name: string;
  color: string;
}
