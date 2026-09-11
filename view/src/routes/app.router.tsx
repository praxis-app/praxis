import { App } from '@/components/app/app';
import { ErrorPage } from '@/pages/error-page';
import { ExplorePage } from '@/pages/landing/explore-page';
import { PublicLandingPage } from '@/pages/landing/public-landing-page';
import { RootPage } from '@/pages/landing/root-page';
import { PageNotFound } from '@/pages/page-not-found';
import { authRouter } from '@/routes/auth.router';
import { instanceSettingsRouter } from '@/routes/instance-settings.router';
import { invitesRouter } from '@/routes/invites.router';
import { serversRouter } from '@/routes/servers.router';
import { usersRouter } from '@/routes/users.router';
import { createBrowserRouter } from 'react-router-dom';

export const appRouter = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <RootPage />,
      },
      {
        path: 'explore',
        element: <ExplorePage />,
      },
      {
        path: 'about',
        element: <PublicLandingPage />,
      },
      {
        path: '*',
        element: <PageNotFound />,
      },
      authRouter,
      instanceSettingsRouter,
      invitesRouter,
      serversRouter,
      usersRouter,
    ],
  },
]);
