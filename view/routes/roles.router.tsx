import { RouteObject } from 'react-router-dom';
import EditServerRole from '../pages/Roles/EditServerRole/EditServerRole';
import ServerRolesIndex from '../pages/Roles/ServerRolesIndex/ServerRolesIndex';

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
