import { useReactiveVar } from '@apollo/client';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import PublicGroupsFeed from '../../components/Groups/PublicGroupsFeed';
import ProgressBar from '../../components/Shared/ProgressBar';
import ToggleForms from '../../components/Shared/ToggleForms';
import HomeFeed from '../../components/Users/HomeFeed';
import { isVerifiedVar } from '../../graphql/cache';
import { useHomePageQuery } from '../../graphql/users/queries/gen/HomePage.gen';
import { isDeniedAccess } from '../../utils/error.utils';

const HomePage = () => {
  const isVerified = useReactiveVar(isVerifiedVar);
  const { data, loading, error } = useHomePageQuery({ skip: !isVerified });

  const { t } = useTranslation();

  if (!isVerified) {
    return <PublicGroupsFeed />;
  }

  if (loading) {
    return <ProgressBar />;
  }

  if (isDeniedAccess(error)) {
    return <Typography>{t('prompts.permissionDenied')}</Typography>;
  }

  if (error) {
    return <Typography>{t('errors.somethingWentWrong')}</Typography>;
  }

  if (!data) {
    return null;
  }

  return (
    <>
      <ToggleForms me={data.me} />
      <HomeFeed />
    </>
  );
};

export default HomePage;
