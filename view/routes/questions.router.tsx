import { RouteObject } from 'react-router-dom';
import ServerQuestions from '../pages/Questions/ServerQuestions';
import VibeCheck from '../pages/Questions/VibeCheck';

const questionsRouter: RouteObject = {
  path: '/questions',
  children: [
    {
      path: '',
      element: <VibeCheck />,
    },
    {
      path: 'manage',
      element: <ServerQuestions />,
    },
  ],
};

export default questionsRouter;
