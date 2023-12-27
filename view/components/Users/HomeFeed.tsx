import { Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DEFAULT_PAGE_SIZE } from '../../constants/shared.constants';
import { useHomeFeedLazyQuery } from '../../graphql/users/queries/gen/HomeFeed.gen';
import { isDeniedAccess } from '../../utils/error.utils';
import Feed from '../Shared/Feed';

const HomeFeed = () => {
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PAGE_SIZE);
  const [prevEndCursor, setPrevEndCursor] = useState<string>();

  const [getHomeFeed, { data, loading, error }] = useHomeFeedLazyQuery({
    variables: { first: rowsPerPage },
  });

  const { t } = useTranslation();

  useEffect(() => {
    getHomeFeed({
      variables: { first: rowsPerPage },
    });
  }, [getHomeFeed, rowsPerPage]);

  const handleNextPage = async () => {
    if (!data?.me.homeFeed.pageInfo.hasNextPage) {
      return;
    }
    const { endCursor, hasPreviousPage } = data.me.homeFeed.pageInfo;
    if (hasPreviousPage) {
      setPrevEndCursor(endCursor);
    }
    await getHomeFeed({
      variables: {
        first: rowsPerPage,
        after: endCursor,
      },
    });
  };

  const handlePrevPage = async () => {
    await getHomeFeed({
      variables: {
        first: rowsPerPage,
        after: prevEndCursor,
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
    <Feed
      feed={data?.me.homeFeed}
      onNextPage={handleNextPage}
      onPrevPage={handlePrevPage}
      rowsPerPage={rowsPerPage}
      setRowsPerPage={setRowsPerPage}
      isLoading={loading}
    />
  );
};

export default HomeFeed;
