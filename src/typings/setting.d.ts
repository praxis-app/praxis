interface ClientSetting {
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
