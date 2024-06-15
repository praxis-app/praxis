import {
  Card,
  CardContent as MuiCardContent,
  Typography,
  styled,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import LevelOneHeading from '../../components/Shared/LevelOneHeading';
import ProgressBar from '../../components/Shared/ProgressBar';
import { useAboutQuery } from '../../graphql/about/queries/gen/About.gen';
import {
  convertBoldToSpan,
  parseMarkdownText,
  urlifyText,
} from '../../utils/shared.utils';

const CardContent = styled(MuiCardContent)(() => ({
  '&:last-child': {
    paddingBottom: 16,
  },
}));

const About = () => {
  const [formattedAboutText, setFormattedAboutText] = useState<string>();
  const { data, loading, error } = useAboutQuery();

  const { t } = useTranslation();

  const serverConfig = data?.serverConfig;
  const aboutText = serverConfig?.about;
  const serverName = serverConfig?.websiteURL?.replace(
    /^(https?:\/\/)?(www\.)?/,
    '',
  );

  useEffect(() => {
    if (!aboutText) {
      return;
    }
    const formatDescription = async () => {
      const urlified = urlifyText(aboutText);
      const markdown = await parseMarkdownText(urlified);
      const formatted = convertBoldToSpan(markdown);
      setFormattedAboutText(formatted);
    };
    formatDescription();
  }, [aboutText]);

  if (loading) {
    return <ProgressBar />;
  }

  if (error) {
    return <Typography>{t('errors.somethingWentWrong')}</Typography>;
  }

  if (!data || !formattedAboutText) {
    return null;
  }

  return (
    <>
      <LevelOneHeading header>{serverName}</LevelOneHeading>

      <Card>
        <CardContent>
          <Typography
            dangerouslySetInnerHTML={{ __html: formattedAboutText }}
            whiteSpace="pre-wrap"
          />
        </CardContent>
      </Card>
    </>
  );
};

export default About;
