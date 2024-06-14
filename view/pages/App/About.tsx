import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import ProgressBar from '../../components/Shared/ProgressBar';
import { useAboutQuery } from '../../graphql/about/queries/gen/About.gen';

const About = () => {
  const { data, loading, error } = useAboutQuery();

  const { t } = useTranslation();

  if (loading) {
    return <ProgressBar />;
  }

  if (error) {
    return <Typography>{t('errors.somethingWentWrong')}</Typography>;
  }

  if (!data) {
    return null;
  }

  return <>{data.serverConfig.about}</>;
};

export default About;
