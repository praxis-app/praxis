import { useReactiveVar } from '@apollo/client';
import { Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DEFAULT_PAGE_SIZE } from '../../constants/shared.constants';
import { isAuthDoneVar, isVerifiedVar } from '../../graphql/cache';
import { usePublicGroupsFeedLazyQuery } from '../../graphql/groups/queries/gen/PublicGroupsFeed.gen';
import { isDeniedAccess } from '../../utils/error.utils';
import WelcomeCard from '../About/WelcomeCard';
import Feed from '../Shared/Feed';

const PublicGroupsFeed = () => {
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PAGE_SIZE);
  const [page, setPage] = useState(0);

  const isAuthDone = useReactiveVar(isAuthDoneVar);
  const isVerified = useReactiveVar(isVerifiedVar);

  const [getPublicGroupsFeed, { data, loading, error }] =
    usePublicGroupsFeedLazyQuery({
      errorPolicy: 'all',
    });

  const { t } = useTranslation();

  useEffect(() => {
    if (isAuthDone && !isVerified) {
      getPublicGroupsFeed({
        variables: {
          limit: rowsPerPage,
          offset: page * rowsPerPage,
        },
      });
    }
  }, [getPublicGroupsFeed, rowsPerPage, isAuthDone, isVerified, page]);

  const handleChangePage = async (newPage: number) => {
    await getPublicGroupsFeed({
      variables: {
        limit: rowsPerPage,
        offset: newPage * rowsPerPage,
      },
    });
  };

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
        feedItems={data?.publicGroupsFeed.nodes}
        totalCount={data?.publicGroupsFeed.totalCount}
        isLoading={loading}
        onChangePage={handleChangePage}
        page={page}
        rowsPerPage={rowsPerPage}
        setPage={setPage}
        setRowsPerPage={setRowsPerPage}
      />
    </>
  );
};

export default PublicGroupsFeed;
