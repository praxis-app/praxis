import {
  Card,
  CardContent as MuiCardContent,
  Typography,
  styled,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import LevelOneHeading from '../../components/Shared/LevelOneHeading';
import ProgressBar from '../../components/Shared/ProgressBar';
import { useAboutQuery } from '../../graphql/about/queries/gen/About.gen';

const CardContent = styled(MuiCardContent)(() => ({
  '&:last-child': {
    paddingBottom: 16,
  },
}));

const About = () => {
  const { data, loading, error } = useAboutQuery();

  const { t } = useTranslation();

  const serverConfig = data?.serverConfig;
  const serverName = serverConfig?.websiteURL?.replace(
    /^(https?:\/\/)?(www\.)?/,
    '',
  );

  if (loading) {
    return <ProgressBar />;
  }

  if (error) {
    return <Typography>{t('errors.somethingWentWrong')}</Typography>;
  }

  if (!data) {
    return null;
  }

  return (
    <>
      <LevelOneHeading header>{serverName}</LevelOneHeading>

      <Card>
        <CardContent>
          <Typography>{data.serverConfig.about}</Typography>
        </CardContent>
      </Card>
    </>
  );
};

export default About;
