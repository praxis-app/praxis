import { api } from '@/client/api-client';
import { NavigationPaths } from '@/constants/shared.constants';
import { useMeQuery } from '@/hooks/use-me-query';
import { useAuthStore } from '@/store/auth.store';
import { useQuery } from '@tanstack/react-query';

interface UseAuthDataProps {
  isMeQueryEnabled?: boolean;
  isFirstUserQueryEnabled?: boolean;
}

export const useAuthData = ({
  isMeQueryEnabled = true,
  isFirstUserQueryEnabled = false,
}: UseAuthDataProps = {}) => {
  const { isLoggedIn, accessToken, inviteToken } = useAuthStore();

  const {
    data: meData,
    isLoading: isMeLoading,
    isSuccess: isMeSuccess,
    isError: isMeError,
  } = useMeQuery({ enabled: isMeQueryEnabled && isLoggedIn });

  const isAuthError = isMeError || !accessToken;

  const { data, isLoading: isFirstUserLoading } = useQuery({
    queryKey: ['is-first-user'],
    queryFn: api.isFirstUser,
    enabled: isFirstUserQueryEnabled && isAuthError,
    refetchOnMount: false,
  });

  const me = meData?.user;
  const isAnon = !!me && me.anonymous === true;
  const isRegistered = !!me && me.anonymous === false;
  const isFirstUser = !!data?.isFirstUser;
  const isInvited = !!inviteToken;

  const signUpPath =
    isFirstUser || !inviteToken
      ? NavigationPaths.SignUp
      : `${NavigationPaths.SignUp}/${inviteToken}`;

  const getShowSignUp = () => {
    if (isAnon) {
      return true;
    }
    if (isLoggedIn) {
      return false;
    }
    return isFirstUser || isInvited;
  };

  return {
    isAnon,
    isRegistered,
    isInvited: !!inviteToken,
    isFirstUser: data?.isFirstUser,
    isFirstUserLoading,
    showSignUp: getShowSignUp(),
    inviteToken,
    signUpPath,
    isMeLoading,
    isMeSuccess,
    isMeError,
    isAuthError,
    isLoggedIn,
    me,
  };
};
