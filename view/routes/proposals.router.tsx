import { RouteObject } from 'react-router-dom';
import EditProposal from '../pages/Proposals/EditProposal/EditProposal';
import ProposalPage from '../pages/Proposals/ProposalPage/ProposalPage';

const proposalsRouter: RouteObject = {
  path: '/proposals',
  children: [
    {
      path: ':id',
      element: <ProposalPage />,
    },
    {
      path: ':id/edit',
      element: <EditProposal />,
    },
  ],
};

export default proposalsRouter;
