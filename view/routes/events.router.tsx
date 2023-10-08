import { RouteObject } from 'react-router-dom';
import EditEvent from '../pages/Events/EditEvent';
import EventPage from '../pages/Events/EventPage';
import EventsIndex from '../pages/Events/EventsIndex';

const eventsRouter: RouteObject = {
  path: '/events',
  children: [
    {
      path: '',
      element: <EventsIndex />,
    },
    {
      path: ':id',
      element: <EventPage />,
    },
    {
      path: ':id/edit',
      element: <EditEvent />,
    },
  ],
};

export default eventsRouter;
