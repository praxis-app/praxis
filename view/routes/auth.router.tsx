import { RouteObject } from 'react-router-dom';
import Login from '../pages/Auth/Login';
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
  ],
};

export default authRouter;
