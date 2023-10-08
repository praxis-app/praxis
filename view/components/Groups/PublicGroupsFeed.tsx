import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { usePublicGroupsFeedQuery } from '../../apollo/groups/generated/PublicGroupsFeed.query';
import { isDeniedAccess } from '../../utils/error.utils';
import WelcomeCard from '../About/WelcomeCard';
import Feed from '../Shared/Feed';
import ProgressBar from '../Shared/ProgressBar';

const PublicGroupsFeed = () => {
  const { data, loading, error } = usePublicGroupsFeedQuery({
    errorPolicy: 'all',
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
      <Feed feed={data.publicGroupsFeed} />
    </>
  );
};

export default PublicGroupsFeed;
