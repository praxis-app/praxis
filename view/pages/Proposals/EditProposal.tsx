import { Typography } from '@mui/material';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useEditProposalLazyQuery } from '../../apollo/proposals/generated/EditProposal.query';
import ProgressBar from '../../components/Shared/ProgressBar';

const EditProposal = () => {
  const [getProposal, { data, loading, error }] = useEditProposalLazyQuery();

  const { id } = useParams();
  const { t } = useTranslation();

  useEffect(() => {
    if (id) {
      getProposal({
        variables: { id: parseInt(id) },
      });
    }
  }, [id, getProposal]);

  if (error) {
    return <Typography>{t('errors.somethingWentWrong')}</Typography>;
  }

  if (loading) {
    return <ProgressBar />;
  }

  if (!data) {
    return null;
  }

  // TODO: Uncomment when implementing revisions or drafts for proposals
  // const { proposal } = data;
  // return (
  //   <>
  //     <Card sx={{ marginBottom: 2.5 }}>
  //       <ProposalForm editProposal={proposal} />
  //     </Card>
  //     <DeleteProposalButton proposalId={proposal.id} />
  //   </>
  // );

  return <Typography>{t('prompts.inDev')}</Typography>;
};

export default EditProposal;
