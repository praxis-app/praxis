interface ClientMotion {
  id: string;
  userId: string;
  groupId: string;
  motionGroupId?: string;
  body: string;
  action: string;
  actionData: ActionData;
  stage: string;
  createdAt: string;
  __typename: string;
}

interface ActionData {
  groupName?: string;
  groupDescription?: string;
  groupImagePath?: string;
  groupImage?: File;
  groupSettings?: SettingInput[];
  groupRole?: ProposedRole;
  groupRolePermissions?: InitialPermission[];
  groupRoleId?: string;
  userId?: string;
}
