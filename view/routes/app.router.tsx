import { createBrowserRouter } from 'react-router-dom';
import Layout from '../components/App/Layout';
import HomePage from '../pages/App/HomePage';
import PageNotFound from '../pages/App/PageNotFound';
import DocsHomePage from '../pages/Docs/DocsHomePage';
import ServerInvite from '../pages/Invites/ServerInvite';
import ServerInvites from '../pages/Invites/ServerInvites';
import Notifications from '../pages/Notifications/Notifications';
import ServerQuestions from '../pages/Questions/ServerQuestions';
import VibeCheck from '../pages/Questions/VibeCheck';
import CanaryPage from '../pages/Settings/CanaryPage';
import ServerSettings from '../pages/Settings/ServerSettings';
import authRouter from './auth.router';
import eventsRouter from './events.router';
import groupsRouter from './groups.router';
import postsRouter from './posts.router';
import proposalsRouter from './proposals.router';
import questionnairesRouter from './questionnaires.router';
import rolesRouter from './roles.router';
import rulesRouter from './rules.router';
import usersRouter from './users.router';

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
        path: 'canary',
        element: <CanaryPage />,
      },
      {
        path: 'vibe-check',
        element: <VibeCheck />,
      },
      {
        path: 'questions',
        element: <ServerQuestions />,
      },
      {
        path: 'activity',
        element: <Notifications />,
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
      questionnairesRouter,
      rolesRouter,
      rulesRouter,
      usersRouter,
    ],
  },
]);

export default appRouter;
