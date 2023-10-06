// TODO: Refactor to avoid duplicating auth state

import { ReactNode, useEffect } from 'react';
import { useAuthCheckQuery } from '../../apollo/auth/generated/AuthCheck.query';
import { isAuthLoadingVar, isLoggedInVar } from '../../apollo/cache';
import TopNav from '../Navigation/TopNav';

interface Props {
  children: ReactNode;
}

const AuthWrapper = ({ children }: Props) => {
  const { loading } = useAuthCheckQuery({
    onCompleted({ authCheck }) {
      isLoggedInVar(authCheck);
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
