import { NavigationPaths } from '../constants/shared.constants';

export const getUserProfilePath = (userName?: string) =>
  userName ? `${NavigationPaths.Users}/${userName}` : '/';
