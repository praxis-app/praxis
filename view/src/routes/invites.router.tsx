import { type RouteObject } from 'react-router-dom';
import { InviteCheck } from '@/pages/invites/invite-check';
import { JoinServerPage } from '@/pages/invites/join-server-page';

export const invitesRouter: RouteObject = {
  path: 'i/:token',
  children: [
    {
      index: true,
      element: <InviteCheck />,
    },
    {
      path: 'join',
      element: <JoinServerPage />,
    },
  ],
};
