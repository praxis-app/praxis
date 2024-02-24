// TODO: Refactor to avoid duplicating auth state

import { ReactNode, useEffect } from 'react';
import { useAuthWrapperQuery } from '../../graphql/auth/queries/gen/AuthWrapper.gen';
import {
  isAuthDoneVar,
  isAuthErrorVar,
  isAuthLoadingVar,
  isLoggedInVar,
  isVerifiedVar,
} from '../../graphql/cache';
import TopNav from '../Navigation/TopNav';

interface Props {
  children: ReactNode;
}

const AuthWrapper = ({ children }: Props) => {
  const { loading, called } = useAuthWrapperQuery({
    onCompleted({ authCheck, me }) {
      isLoggedInVar(authCheck);
      isAuthErrorVar(!authCheck);
      isVerifiedVar(me.isVerified);
      isAuthDoneVar(true);
    },
    onError() {
      isAuthErrorVar(true);
      isAuthDoneVar(true);
    },
  });

  useEffect(() => {
    isAuthLoadingVar(loading);
  }, [loading, called]);

  if (loading) {
    return <TopNav />;
  }

  return <>{children}</>;
};

export default AuthWrapper;
