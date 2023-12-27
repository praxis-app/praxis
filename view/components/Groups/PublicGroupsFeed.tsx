// TODO: Update PublicGroupsFeed query to use pagination

import { useReactiveVar } from '@apollo/client';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { authFailedVar } from '../../graphql/cache';
import { usePublicGroupsFeedQuery } from '../../graphql/groups/queries/gen/PublicGroupsFeed.gen';
import { isDeniedAccess } from '../../utils/error.utils';
import WelcomeCard from '../About/WelcomeCard';
import Feed from '../Shared/Feed';
import ProgressBar from '../Shared/ProgressBar';
import { useState } from 'react';
import { DEFAULT_PAGE_SIZE } from '../../constants/shared.constants';

const PublicGroupsFeed = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PAGE_SIZE);

  const authFailed = useReactiveVar(authFailedVar);
  const { data, loading, error } = usePublicGroupsFeedQuery({
    errorPolicy: 'all',
    skip: !authFailed,
  });

  const { t } = useTranslation();

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

  return (
    <>
      <WelcomeCard />
      <Feed
        feed={data.publicGroupsFeed}
        page={page}
        rowsPerPage={rowsPerPage}
        setPage={setPage}
        setRowsPerPage={setRowsPerPage}
      />
    </>
  );
};

export default PublicGroupsFeed;
