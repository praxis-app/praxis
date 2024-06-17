import { RouteObject } from 'react-router-dom';
import VibeChat from '../pages/Chat/VibeChat';
import QuestionnairePage from '../pages/Questions/QuestionnairePage';
import ServerQuestionnaires from '../pages/Questions/ServerQuestionnaires';
import ServerQuestions from '../pages/Questions/ServerQuestions';
import VibeCheck from '../pages/Questions/VibeCheck';

const vibeChecksRouter: RouteObject = {
  path: '/vibe-checks',
  children: [
    {
      path: '',
      element: <ServerQuestionnaires />,
    },
    {
      path: ':id',
      element: <QuestionnairePage />,
    },
    {
      path: 'me',
      element: <VibeCheck />,
    },
    {
      path: 'chat',
      element: <VibeChat />,
    },
    {
      path: 'questions',
      element: <ServerQuestions />,
    },
  ],
};

export default vibeChecksRouter;
