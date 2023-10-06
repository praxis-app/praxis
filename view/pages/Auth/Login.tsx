import { useReactiveVar } from '@apollo/client';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isLoggedInVar } from '../../apollo/cache';
import LoginForm from '../../components/Auth/LoginForm';
import ProgressBar from '../../components/Shared/ProgressBar';
import { NavigationPaths } from '../../constants/shared.constants';

const Login = () => {
  const isLoggedIn = useReactiveVar(isLoggedInVar);
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) {
      navigate(NavigationPaths.Home);
    }
  }, [isLoggedIn, navigate]);

  if (isLoggedIn) {
    return <ProgressBar />;
  }

  return <LoginForm />;
};

export default Login;
