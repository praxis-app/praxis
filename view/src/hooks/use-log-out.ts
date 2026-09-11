// TODO: Add confirm dialog to log out

import { api } from '@/client/api-client';
import {
  LocalStorageKeys,
  NavigationPaths,
} from '@/constants/shared.constants';
import { useAuthStore } from '@/store/auth.store';
import { useNavStore } from '@/store/nav.store';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

interface UseLogOutOptions {
  onSuccess?: () => void;
}

export const useLogOut = (options: UseLogOutOptions = {}) => {
  const { setIsLoggedIn, setAccessToken, setInviteToken } = useAuthStore();
  const { setIsNavSheetOpen } = useNavStore();

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const result = useMutation({
    mutationFn: api.logOut,
    onSuccess: async () => {
      localStorage.removeItem(LocalStorageKeys.AccessToken);
      localStorage.removeItem(LocalStorageKeys.InviteToken);
      setIsNavSheetOpen(false);
      setIsLoggedIn(false);
      setAccessToken(null);
      setInviteToken(null);
      queryClient.clear();
      options.onSuccess?.();
      await navigate(NavigationPaths.Explore, { replace: true });
    },
  });

  return result;
};
