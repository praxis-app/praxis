import { useReactiveVar } from '@apollo/client';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../../components/Auth/LoginForm';
import ProgressBar from '../../components/Shared/ProgressBar';
import { NavigationPaths } from '../../constants/shared.constants';
import { isLoggedInVar } from '../../graphql/cache';
import { useIsVerifiedUserLazyQuery } from '../../graphql/users/queries/gen/IsVerifiedUser.gen';

const Login = () => {
  const isLoggedIn = useReactiveVar(isLoggedInVar);
  const [getIsVerifiedUser] = useIsVerifiedUserLazyQuery();

  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) {
      const handleRedirect = async () => {
        const { data } = await getIsVerifiedUser();
        if (data?.me.isVerified) {
          navigate(NavigationPaths.Home);
        } else {
          navigate(NavigationPaths.MyVibeCheck);
        }
      };
      handleRedirect();
    }
  }, [isLoggedIn, navigate, getIsVerifiedUser]);

  if (isLoggedIn) {
    return <ProgressBar />;
  }

  return <LoginForm />;
};

export default Login;
