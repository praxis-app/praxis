interface Setting {
  id: string;
  userId: string;
  groupId: string;
  name: string;
  value: string;
  createdAt: string;
}

interface SettingInput {
  id: string;
  userId?: string;
  groupId?: string;
  name: string;
  value: string;
}

interface BackendSetting {
  id: number;
  userId: number | null;
  groupId: number | null;
  name: string | null;
  value: string | null;
  createdAt: Date;
}
