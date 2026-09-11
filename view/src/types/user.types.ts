import { type ImageRes } from './image.types';
import { type InstancePermission, type ServerPermission } from './role.types';
import { type ServerRes } from './server.types';

export interface UserRes {
  id: string;
  name: string;
  displayName?: string;
  profilePicture: ImageRes | null;
}

export interface CurrentUserRes {
  id: string;
  name: string;
  displayName?: string;
  anonymous: boolean;
  permissions: {
    instance: InstancePermission[];
    servers: Record<string, ServerPermission[]>;
  };
  profilePicture: ImageRes | null;
  currentServer: ServerRes | null;
  serversCount: number;
}

export interface UserProfileRes {
  id: string;
  name: string;
  displayName?: string;
  bio?: string;
  profilePicture: ImageRes | null;
  coverPhoto: ImageRes | null;
}

export interface UpdateUserProfileReq {
  name?: string;
  displayName?: string;
  bio?: string;
}

export interface CurrentUser extends CurrentUserRes {
  profilePicture: (ImageRes & { url: string }) | null;
}
