interface Role {
  id: string;
  groupId: string;
  name: string;
  color: string;
}

interface BackendRole {
  id: number;
  name: string;
  color: string;
  global: boolean;
  groupId: number | null;
  createdAt: Date;
}

interface Permission {
  id: string;
  roleId: string;
  name: string;
  description: string;
  enabled: boolean;
  createdAt: string;
}

interface BackendPermission {
  id: number;
  roleId: number | null;
  name: string;
  description: string;
  enabled: boolean;
  createdAt: Date;
}

interface RoleMember {
  id: string;
  roleId: string;
  userId: string;
  createdAt: Date;
}

interface BackendRoleMember {
  id: number;
  roleId: number | null;
  userId: number | null;
  createdAt: Date;
}
