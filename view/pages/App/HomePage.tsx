import { useReactiveVar } from '@apollo/client';
import PublicGroupsFeed from '../../components/Groups/PublicGroupsFeed';
import HomeFeed from '../../components/Users/HomeFeed';
import { isLoggedInVar } from '../../graphql/cache';
import ToggleForms from '../../components/Shared/ToggleForms';
import { useHomePageQuery } from '../../graphql/users/queries/gen/HomePage.gen';
import ProgressBar from '../../components/Shared/ProgressBar';
import { isDeniedAccess } from '../../utils/error.utils';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

const HomePage = () => {
  const isLoggedIn = useReactiveVar(isLoggedInVar);
  const { data, loading, error } = useHomePageQuery({ skip: !isLoggedIn });

  const { t } = useTranslation();

  if (!isLoggedIn) {
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
