interface Motion {
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

interface BackendMotion {
  id: number;
  userId: number | null;
  groupId: number | null;
  body: string | null;
  action: string | null;
  actionData: JsonValue | null;
  stage: string | null;
  createdAt: Date;
  __typename?: string;
}

interface ActionData {
  newGroupName?: string;
  newGroupDescription?: string;
  newGroupImagePath?: string;
  newGroupImage?: File;
}

interface ActionTypeOption {
  message: string;
  value: ActionTypes;
}
