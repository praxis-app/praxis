import { RouteObject } from 'react-router-dom';
import Login from '../pages/Auth/Login';
import ResetPassword from '../pages/Auth/ResetPassword';
import SignUp from '../pages/Auth/SignUp';

const authRouter: RouteObject = {
  path: '/auth',
  children: [
    {
      path: 'login',
      element: <Login />,
    },
    {
      path: 'signup',
      element: <SignUp />,
    },
    {
      path: 'signup/:token',
      element: <SignUp />,
    },
    {
      path: 'reset-password',
      element: <ResetPassword />,
    },
    {
      path: 'reset-password/:token',
      element: <ResetPassword />,
    },
  ],
};

export default authRouter;
