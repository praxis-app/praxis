import { useReactiveVar } from '@apollo/client';
import { Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DEFAULT_PAGE_SIZE } from '../../constants/shared.constants';
import { authFailedVar } from '../../graphql/cache';
import { usePublicGroupsFeedLazyQuery } from '../../graphql/groups/queries/gen/PublicGroupsFeed.gen';
import { isDeniedAccess } from '../../utils/error.utils';
import WelcomeCard from '../About/WelcomeCard';
import Feed from '../Shared/Feed';

const PublicGroupsFeed = () => {
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PAGE_SIZE);

  const authFailed = useReactiveVar(authFailedVar);
  const [getPublicGroupsFeed, { data, loading, error }] =
    usePublicGroupsFeedLazyQuery({
      errorPolicy: 'all',
    });

  const { t } = useTranslation();

  useEffect(() => {
    if (!authFailed) {
      return;
    }
    getPublicGroupsFeed({
      variables: { first: rowsPerPage },
    });
  }, [getPublicGroupsFeed, rowsPerPage, authFailed]);

  if (isDeniedAccess(error)) {
    return <Typography>{t('prompts.permissionDenied')}</Typography>;
  }
  if (error) {
    return <Typography>{t('errors.somethingWentWrong')}</Typography>;
  }

  return (
    <>
      <WelcomeCard />
      <Feed
        feedItems={data?.publicGroupsFeed}
        rowsPerPage={rowsPerPage}
        setRowsPerPage={setRowsPerPage}
        isLoading={loading}
        page={0}
      />
    </>
  );
};

export default PublicGroupsFeed;
