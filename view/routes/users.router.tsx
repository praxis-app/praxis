import { RouteObject } from 'react-router-dom';
import EditUserProfile from '../pages/Users/EditUserProfile/EditUserProfile';
import Followers from '../pages/Users/Followers/Followers';
import Following from '../pages/Users/Following/Following';
import UserProfile from '../pages/Users/UserProfile/UserProfile';
import UsersIndex from '../pages/Users/UsersIndex/UsersIndex';

const usersRouter: RouteObject = {
  path: '/users',
  children: [
    {
      path: '',
      element: <UsersIndex />,
    },
    {
      path: ':name',
      element: <UserProfile />,
    },
    {
      path: ':name/edit',
      element: <EditUserProfile />,
    },
    {
      path: ':name/followers',
      element: <Followers />,
    },
    {
      path: ':name/following',
      element: <Following />,
    },
  ],
};

export default usersRouter;
