import { RouteObject } from 'react-router-dom';
import EditEvent from '../pages/Events/EditEvent/EditEvent';
import EventPage from '../pages/Events/EventPage/EventPage';
import EventsIndex from '../pages/Events/EventsIndex/EventsIndex';

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
