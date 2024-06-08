import { RouteObject } from 'react-router-dom';
import EditServerRole from '../pages/Roles/EditServerRole';
import ServerRolesIndex from '../pages/Roles/ServerRolesIndex';
import ViewServerRoles from '../pages/Roles/ViewServerRoles';

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
    {
      path: 'view',
      element: <ViewServerRoles />,
    },
  ],
};

export default rolesRouter;
