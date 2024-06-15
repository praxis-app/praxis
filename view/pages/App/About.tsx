import { Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Accordion, {
  AccordionDetails,
  AccordionSummary,
} from '../../components/Shared/Accordion';
import LevelOneHeading from '../../components/Shared/LevelOneHeading';
import ProgressBar from '../../components/Shared/ProgressBar';
import { useAboutQuery } from '../../graphql/about/queries/gen/About.gen';
import {
  convertBoldToSpan,
  parseMarkdownText,
  urlifyText,
} from '../../utils/shared.utils';

const About = () => {
  const [showAboutText, setShowAboutText] = useState(true);
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

      <Accordion
        expanded={showAboutText}
        onChange={() => setShowAboutText(!showAboutText)}
        sx={{ borderRadius: 2, paddingX: 2 }}
      >
        <AccordionSummary>
          <Typography fontFamily="Inter Bold">
            {t('about.labels.about')}
          </Typography>
        </AccordionSummary>

        <AccordionDetails sx={{ paddingBottom: 2.25 }}>
          <Typography
            dangerouslySetInnerHTML={{ __html: formattedAboutText }}
            whiteSpace="pre-wrap"
          />
        </AccordionDetails>
      </Accordion>
    </>
  );
};

export default About;
