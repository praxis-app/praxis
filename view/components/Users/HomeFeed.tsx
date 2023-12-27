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
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PAGE_SIZE);

  const { data, loading, error } = useHomeFeedQuery({
    variables: {
      limit: rowsPerPage,
      offset: page * rowsPerPage,
    },
  });

  const { t } = useTranslation();

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
          page={page}
          rowsPerPage={rowsPerPage}
          setPage={setPage}
          setRowsPerPage={setRowsPerPage}
        />
      )}
    </>
  );
};

export default HomeFeed;
