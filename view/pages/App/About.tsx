import { Button, Divider, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import ServerRoleView from '../../components/Roles/ServerRoles/ServerRoleView';
import Rule from '../../components/Rules/Rule';
import Accordion, {
  AccordionDetails,
  AccordionSummary,
} from '../../components/Shared/Accordion';
import Flex from '../../components/Shared/Flex';
import LevelOneHeading from '../../components/Shared/LevelOneHeading';
import ProgressBar from '../../components/Shared/ProgressBar';
import { NavigationPaths } from '../../constants/shared.constants';
import { useAboutQuery } from '../../graphql/about/queries/gen/About.gen';
import {
  convertBoldToSpan,
  parseMarkdownText,
  urlifyText,
} from '../../utils/shared.utils';

const About = () => {
  const [showAboutText, setShowAboutText] = useState(true);
  const [showServerRules, setShowServerRules] = useState(true);
  const [showServerRoles, setShowServerRoles] = useState(false);
  const [formattedAboutText, setFormattedAboutText] = useState<string>();

  const { data, loading, error } = useAboutQuery();

  const { t } = useTranslation();
  const navigate = useNavigate();

  const serverConfig = data?.serverConfig;
  const serverRules = data?.serverRules;
  const serverRoles = data?.serverRoles;

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

  if (!serverRules || !serverRoles) {
    return null;
  }

  return (
    <>
      <LevelOneHeading header>{serverName}</LevelOneHeading>

      <Accordion
        expanded={showAboutText}
        onChange={() => setShowAboutText(!showAboutText)}
        sx={{ borderRadius: 2, paddingX: 2, marginBottom: 2 }}
      >
        <AccordionSummary>
          <Typography fontFamily="Inter Bold">
            {t('about.labels.about')}
          </Typography>
        </AccordionSummary>

        <AccordionDetails sx={{ paddingBottom: 2.25 }}>
          {formattedAboutText ? (
            <Typography
              dangerouslySetInnerHTML={{ __html: formattedAboutText }}
              whiteSpace="pre-wrap"
              paddingBottom={2.2}
            />
          ) : (
            <Typography paddingBottom={2.2}>
              {t('about.prompts.noAboutText')}
            </Typography>
          )}

          <Flex marginLeft={-1}>
            <Button onClick={() => navigate(NavigationPaths.Docs)}>
              {t('about.actions.learnMore')}
            </Button>

            <Button onClick={() => navigate(NavigationPaths.PrivacyPolicy)}>
              {t('privacyPolicy.headers.privacyPolicy')}
            </Button>
          </Flex>
        </AccordionDetails>
      </Accordion>

      <Accordion
        expanded={showServerRules}
        onChange={() => setShowServerRules(!showServerRules)}
        sx={{ borderRadius: 2, paddingX: 2, marginBottom: 2 }}
      >
        <AccordionSummary>
          <Typography fontFamily="Inter Bold">
            {t('rules.labels.serverRules')}
          </Typography>
        </AccordionSummary>

        <AccordionDetails sx={{ paddingBottom: 2.25 }}>
          {serverRules.map((rule, index) => (
            <Rule
              key={rule.id}
              rule={rule}
              isLast={index + 1 !== serverRules.length}
            />
          ))}
        </AccordionDetails>
      </Accordion>

      <Accordion
        expanded={showServerRoles}
        onChange={() => setShowServerRoles(!showServerRoles)}
        sx={{ borderRadius: 2, paddingX: 2, marginBottom: 2 }}
      >
        <AccordionSummary>
          <Typography fontFamily="Inter Bold">
            {t('roles.labels.serverRoles')}
          </Typography>
        </AccordionSummary>

        <AccordionDetails sx={{ paddingBottom: 0.8 }}>
          <Typography marginBottom={2.2}>
            {t('roles.subheaders.viewServerRoles')}
          </Typography>

          <Divider sx={{ marginBottom: 3.2 }} />

          {serverRoles.map((role, index) => (
            <ServerRoleView
              key={role.id}
              role={role}
              withCard={false}
              isLast={index + 1 === serverRoles.length}
            />
          ))}
        </AccordionDetails>
      </Accordion>
    </>
  );
};

export default About;
