// TODO: Refactor to avoid duplicating auth state

import { ReactNode, useEffect } from 'react';
import { useAuthWrapperQuery } from '../../graphql/auth/queries/gen/AuthWrapper.gen';
import {
  authFailedVar,
  isAuthLoadingVar,
  isLoggedInVar,
  isVerifiedVar,
} from '../../graphql/cache';
import TopNav from '../Navigation/TopNav';

interface Props {
  children: ReactNode;
}

const AuthWrapper = ({ children }: Props) => {
  const { loading } = useAuthWrapperQuery({
    onCompleted({ authCheck, me }) {
      isLoggedInVar(authCheck);
      authFailedVar(!authCheck);
      isVerifiedVar(me.isVerified);
    },
    onError() {
      authFailedVar(true);
    },
  });

  useEffect(() => {
    isAuthLoadingVar(loading);
  }, [loading]);

  if (loading) {
    return <TopNav />;
  }

  return <>{children}</>;
};

export default AuthWrapper;
