import { SharedProposalFragment } from '../../graphql/proposals/fragments/gen/SharedProposal.gen';

interface Props {
  proposal?: SharedProposalFragment | null;
}

const SharedProposal = ({ proposal }: Props) => {
  return <>{proposal?.id}</>;
};

export default SharedProposal;
