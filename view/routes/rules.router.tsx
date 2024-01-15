import { RouteObject } from 'react-router-dom';
import ServerRules from '../pages/Rules/ServerRules';

const rulesRouter: RouteObject = {
  path: '/rules',
  children: [
    {
      path: '',
      element: <ServerRules />,
    },
  ],
};

export default rulesRouter;
