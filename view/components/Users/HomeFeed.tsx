import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useHomeFeedQuery } from '../../apollo/users/generated/HomeFeed.query';
import { isDeniedAccess } from '../../utils/error.utils';
import Feed from '../Shared/Feed';
import ProgressBar from '../Shared/ProgressBar';
import ToggleForms from '../Shared/ToggleForms';

const HomeFeed = () => {
  const { data, loading, error } = useHomeFeedQuery();
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

  if (!data?.me) {
    return null;
  }

  const { me } = data;
  const { homeFeed } = me;

  return (
    <>
      <ToggleForms me={me} />
      <Feed feed={homeFeed} />
    </>
  );
};

export default HomeFeed;
