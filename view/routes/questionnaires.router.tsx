import { RouteObject } from 'react-router-dom';
import QuestionnairePage from '../pages/Questions/QuestionnairePage';
import ServerQuestionnaires from '../pages/Questions/ServerQuestionnaires';

const questionnairesRouter: RouteObject = {
  path: '/questionnaires',
  children: [
    {
      path: '',
      element: <ServerQuestionnaires />,
    },
    {
      path: ':id',
      element: <QuestionnairePage />,
    },
  ],
};

export default questionnairesRouter;
