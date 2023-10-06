import { RouteObject } from 'react-router-dom';
import EditServerRole from '../pages/Roles/EditServerRole';
import ServerRolesIndex from '../pages/Roles/ServerRolesIndex';

const rolesRouter: RouteObject = {
  path: '/roles',
  children: [
    {
      path: '',
      element: <ServerRolesIndex />,
    },
    {
      path: ':id/edit',
      element: <EditServerRole />,
    },
  ],
};

export default rolesRouter;
