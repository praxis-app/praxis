import { InvitesPage } from '@/pages/invites/invites-page';
import { EditServerRolePage } from '@/pages/settings/edit-server-role-page';
import { GeneralServerSettings } from '@/pages/settings/general-server-settings';
import { PollSettings } from '@/pages/settings/poll-settings';
import { ServerRoles } from '@/pages/settings/server-roles';
import { Settings } from '@/pages/settings/settings';
import { type RouteObject } from 'react-router-dom';

export const serverSettingsRouter: RouteObject = {
  path: '/s/:serverSlug/settings',
  children: [
    {
      index: true,
      element: <Settings />,
    },
    {
      path: 'general',
      element: <GeneralServerSettings />,
    },
    {
      path: 'invites',
      element: <InvitesPage />,
    },
    {
      path: 'proposals',
      element: <PollSettings />,
    },
    {
      path: 'roles',
      children: [
        {
          index: true,
          element: <ServerRoles />,
        },
        {
          path: ':serverRoleId/edit',
          element: <EditServerRolePage />,
        },
      ],
    },
  ],
};
