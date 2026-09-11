import { ChannelSettings } from '@/pages/channels/channel-settings';
import { type RouteObject } from 'react-router-dom';
import { ChannelPage } from '../pages/channels/channel-page';

export const channelsRouter: RouteObject = {
  path: '/s/:serverSlug/c',
  children: [
    {
      path: ':channelId',
      element: <ChannelPage />,
    },
    {
      path: ':channelId/posts/:postId',
      element: <ChannelPage />,
    },
    {
      path: ':channelId/settings',
      element: <ChannelSettings />,
    },
  ],
};
