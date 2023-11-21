// TODO: Refactor to avoid duplicating auth state

import { ReactNode, useEffect } from 'react';
import { useAuthCheckQuery } from '../../graphql/auth/queries/gen/AuthCheck.gen';
import {
  authFailedVar,
  isAuthLoadingVar,
  isLoggedInVar,
} from '../../graphql/cache';
import TopNav from '../Navigation/TopNav';

interface Props {
  children: ReactNode;
}

const AuthWrapper = ({ children }: Props) => {
  const { loading } = useAuthCheckQuery({
    onCompleted({ authCheck }) {
      isLoggedInVar(authCheck);
      authFailedVar(!authCheck);
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
