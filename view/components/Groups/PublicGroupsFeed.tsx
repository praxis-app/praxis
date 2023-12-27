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
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PAGE_SIZE);
  const [prevEndCursor, setPrevEndCursor] = useState<string>();

  const authFailed = useReactiveVar(authFailedVar);
  const { data, loading, error, refetch } = usePublicGroupsFeedQuery({
    errorPolicy: 'all',
    skip: !authFailed,
  });

  const { t } = useTranslation();

  const handleNextPage = async () => {
    if (!data?.publicGroupsFeed.pageInfo.hasNextPage) {
      return;
    }
    const { endCursor, hasPreviousPage } = data.publicGroupsFeed.pageInfo;
    if (hasPreviousPage) {
      setPrevEndCursor(endCursor);
    }
    await refetch({
      first: rowsPerPage,
      after: endCursor,
    });
  };

  const handlePrevPage = async () => {
    await refetch({
      first: rowsPerPage,
      after: prevEndCursor,
    });
  };

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
        rowsPerPage={rowsPerPage}
        setRowsPerPage={setRowsPerPage}
        onNextPage={handleNextPage}
        onPrevPage={handlePrevPage}
      />
    </>
  );
};

export default PublicGroupsFeed;
