import { type RouteObject } from 'react-router-dom';
import { UserSettings } from '../pages/users/user-settings';

export const usersRouter: RouteObject = {
  path: '/users',
  children: [
    {
      path: 'settings',
      element: <UserSettings />,
    },
  ],
};
