import { createBrowserRouter } from 'react-router-dom';
import Layout from '../components/App/Layout';
import About from '../pages/App/About';
import HomePage from '../pages/App/HomePage';
import PageNotFound from '../pages/App/PageNotFound';
import Chats from '../pages/Chat/Chats';
import DocsHomePage from '../pages/Docs/DocsHomePage';
import ServerInvite from '../pages/Invites/ServerInvite';
import ServerInvites from '../pages/Invites/ServerInvites';
import Notifications from '../pages/Notifications/Notifications';
import CanaryPage from '../pages/Settings/CanaryPage';
import PrivacyPolicy from '../pages/Settings/PrivacyPolicy';
import ServerSettings from '../pages/Settings/ServerSettings';
import authRouter from './auth.router';
import eventsRouter from './events.router';
import groupsRouter from './groups.router';
import postsRouter from './posts.router';
import proposalsRouter from './proposals.router';
import rolesRouter from './roles.router';
import rulesRouter from './rules.router';
import usersRouter from './users.router';
import vibeChecksRouter from './vibeChecks.router';

const appRouter = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: '*',
        element: <PageNotFound />,
      },
      {
        path: 'about',
        element: <About />,
      },
      {
        path: 'invites',
        element: <ServerInvites />,
      },
      {
        path: 'i/:token',
        element: <ServerInvite />,
      },
      {
        path: 'settings',
        element: <ServerSettings />,
      },
      {
        path: 'chats',
        element: <Chats />,
      },
      {
        path: 'activity',
        element: <Notifications />,
      },
      {
        path: 'privacy-policy',
        element: <PrivacyPolicy />,
      },
      {
        path: 'canary',
        element: <CanaryPage />,
      },
      {
        path: 'docs',
        element: <DocsHomePage />,
      },
      authRouter,
      eventsRouter,
      groupsRouter,
      postsRouter,
      proposalsRouter,
      vibeChecksRouter,
      rolesRouter,
      rulesRouter,
      usersRouter,
    ],
  },
]);

export default appRouter;
