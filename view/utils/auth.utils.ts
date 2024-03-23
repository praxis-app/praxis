import { LocalStorageKey } from '../constants/shared.constants';
import {
  isAuthLoadingVar,
  isLoggedInVar,
  isVerifiedVar,
} from '../graphql/cache';
import client from '../graphql/client';

/**
 * Logs out the user by resetting all reactive vars related to authentication,
 * clearing their cache, and removing their access token from local storage.
 */
export const logOutUser = () => {
  isLoggedInVar(false);
  isVerifiedVar(false);
  isAuthLoadingVar(false);

  client.cache.reset();
  localStorage.removeItem(LocalStorageKey.AccessToken);
};
