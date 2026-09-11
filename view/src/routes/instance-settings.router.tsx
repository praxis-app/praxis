import { EditInstanceRolePage } from '@/pages/settings/instance-settings/edit-instance-role-page';
import { EditServerPage } from '@/pages/settings/instance-settings/edit-server-page';
import { InstanceRoles } from '@/pages/settings/instance-settings/instance-roles';
import { ManageServers } from '@/pages/settings/instance-settings/manage-servers';
import { Settings } from '@/pages/settings/settings';
import { type RouteObject } from 'react-router-dom';

export const instanceSettingsRouter: RouteObject = {
  path: '/settings',
  children: [
    {
      index: true,
      element: <Settings />,
    },
    {
      path: 'servers',

      children: [
        {
          index: true,
          element: <ManageServers />,
        },
        {
          path: ':serverId/edit',
          element: <EditServerPage />,
        },
      ],
    },
    {
      path: 'roles',
      children: [
        {
          index: true,
          element: <InstanceRoles />,
        },
        {
          path: ':instanceRoleId/edit',
          element: <EditInstanceRolePage />,
        },
      ],
    },
  ],
};
