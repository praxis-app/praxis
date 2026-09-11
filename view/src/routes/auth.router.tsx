import { type RouteObject } from 'react-router-dom';
import { LoginPage } from '../pages/auth/login-page';
import { SignUp } from '@/pages/auth/sign-up';

export const authRouter: RouteObject = {
  path: '/auth',
  children: [
    {
      path: 'login',
      element: <LoginPage />,
    },
    {
      path: 'signup',
      element: <SignUp />,
    },
    {
      path: 'signup/:token',
      element: <SignUp />,
    },
  ],
};
