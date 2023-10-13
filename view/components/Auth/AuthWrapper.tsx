// TODO: Refactor to avoid duplicating auth state

import { ReactNode, useEffect } from 'react';
import { useAuthCheckQuery } from '../../graphql/auth/queries/gen/AuthCheck.gen';
import { isAuthLoadingVar, isLoggedInVar } from '../../graphql/cache';
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
