import { Typography } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DEFAULT_PAGE_SIZE } from '../../constants/shared.constants';
import { useHomeFeedQuery } from '../../graphql/users/queries/gen/HomeFeed.gen';
import { isDeniedAccess } from '../../utils/error.utils';
import Feed from '../Shared/Feed';
import ProgressBar from '../Shared/ProgressBar';
import ToggleForms from '../Shared/ToggleForms';

const HomeFeed = () => {
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PAGE_SIZE);
  const [prevEndCursor, setPrevEndCursor] = useState<string>();

  const { data, loading, error, refetch } = useHomeFeedQuery({
    variables: { first: rowsPerPage },
  });

  const { t } = useTranslation();

  const handleNextPage = async () => {
    if (!data?.me.homeFeed.pageInfo.hasNextPage) {
      return;
    }
    const { endCursor, hasPreviousPage } = data.me.homeFeed.pageInfo;
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

  if (isDeniedAccess(error)) {
    return <Typography>{t('prompts.permissionDenied')}</Typography>;
  }
  if (error) {
    return <Typography>{t('errors.somethingWentWrong')}</Typography>;
  }

  return (
    <>
      {data?.me && <ToggleForms me={data.me} />}

      {loading && <ProgressBar />}

      {data?.me.homeFeed && (
        <Feed
          feed={data.me.homeFeed}
          onNextPage={handleNextPage}
          onPrevPage={handlePrevPage}
          rowsPerPage={rowsPerPage}
          setRowsPerPage={setRowsPerPage}
        />
      )}
    </>
  );
};

export default HomeFeed;
