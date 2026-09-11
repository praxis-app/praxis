import { ServerHomePage } from '@/pages/servers/server-home-page';
import { channelsRouter } from '@/routes/channels.router';
import { serverSettingsRouter } from '@/routes/server-settings.router';
import { type RouteObject } from 'react-router-dom';
import { EventsPage } from '@/pages/events/events-page';
import { EventDetailPage } from '@/pages/events/event-detail-page';

export const serversRouter: RouteObject = {
  path: 's/:serverSlug',
  children: [
    {
      index: true,
      element: <ServerHomePage />,
    },
    serverSettingsRouter,
    channelsRouter,
    {
      path: 'events',
      children: [
        { index: true, element: <EventsPage /> },
        { path: ':eventId', element: <EventDetailPage /> },
      ],
    },
  ],
};
