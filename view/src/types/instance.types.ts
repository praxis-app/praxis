export interface InstanceConfigRes {
  defaultServerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InstanceConfigReq {
  defaultServerId: string;
}

export interface InstanceCapabilitiesRes {
  videoCallsEnabled: boolean;
}
