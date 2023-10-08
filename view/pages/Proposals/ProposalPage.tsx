import { useReactiveVar } from '@apollo/client';
import { Typography } from '@mui/material';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { isLoggedInVar } from '../../apollo/cache';
import { useProposalLazyQuery } from '../../apollo/proposals/generated/Proposal.query';
import ProposalCard from '../../components/Proposals/ProposalCard';
import ProgressBar from '../../components/Shared/ProgressBar';
import { isDeniedAccess } from '../../utils/error.utils';

const ProposalPage = () => {
  const isLoggedIn = useReactiveVar(isLoggedInVar);
  const [getProposal, { data, loading, error }] = useProposalLazyQuery();

  const { t } = useTranslation();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      getProposal({
        variables: {
          id: parseInt(id),
          isLoggedIn,
        },
      });
    }
  }, [id, isLoggedIn, getProposal]);

  if (loading) {
    return <ProgressBar />;
  }

  if (!data) {
    if (isDeniedAccess(error)) {
      return <Typography>{t('prompts.permissionDenied')}</Typography>;
    }

    if (error) {
      return <Typography>{t('errors.somethingWentWrong')}</Typography>;
    }
    return null;
  }

  return <ProposalCard proposal={data.proposal} />;
};

export default ProposalPage;
