import { useReactiveVar } from '@apollo/client';
import { Box, Button, Divider, Typography } from '@mui/material';
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
import { isAuthDoneVar, isVerifiedVar } from '../../graphql/cache';
import {
  convertBoldToSpan,
  parseMarkdownText,
  urlifyText,
} from '../../utils/shared.utils';

const About = () => {
  const [formattedAboutText, setFormattedAboutText] = useState<string>();
  const [showServerRoles, setShowServerRoles] = useState(false);
  const [showServerRules, setShowServerRules] = useState(true);
  const [showAboutText, setShowAboutText] = useState(true);
  const [showStats, setShowStats] = useState(false);

  const isVerified = useReactiveVar(isVerifiedVar);
  const isAuthDone = useReactiveVar(isAuthDoneVar);
  const { data, loading, error } = useAboutQuery({
    variables: { isVerified },
    skip: !isAuthDone,
  });

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

  if (error) {
    return <Typography>{t('errors.somethingWentWrong')}</Typography>;
  }

  if (loading) {
    return <ProgressBar />;
  }

  if (!data) {
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
          {serverRules?.map((rule, index) => (
            <Rule
              key={rule.id}
              rule={rule}
              isLast={index + 1 !== serverRules.length}
            />
          ))}
        </AccordionDetails>
      </Accordion>

      {isVerified && (
        <Accordion
          expanded={showServerRoles}
          onChange={() => setShowServerRoles(!showServerRoles)}
          sx={{ borderRadius: 2, paddingX: 2, marginBottom: 2 }}
        >
          <AccordionSummary>
            <Typography fontFamily="Inter Bold">
              {t('roles.labels.rolesAndPermissions')}
            </Typography>
          </AccordionSummary>

          <AccordionDetails sx={{ paddingBottom: 0.8 }}>
            <Typography marginBottom={2.2}>
              {t('roles.subheaders.viewServerRoles')}
            </Typography>

            <Divider sx={{ marginBottom: 3.2 }} />

            {serverRoles?.map((role, index) => (
              <ServerRoleView
                key={role.id}
                role={role}
                withCard={false}
                isLast={index + 1 === serverRoles.length}
              />
            ))}
          </AccordionDetails>
        </Accordion>
      )}

      <Accordion
        expanded={showStats}
        onChange={() => setShowStats(!showStats)}
        sx={{ borderRadius: 2, paddingX: 2, marginBottom: 2 }}
      >
        <AccordionSummary>
          <Typography fontFamily="Inter Bold">
            {t('about.labels.serverStats')}
          </Typography>
        </AccordionSummary>

        <AccordionDetails sx={{ paddingBottom: 2.25 }}>
          <Typography gutterBottom>
            <Box
              component="span"
              fontFamily="Inter Extra Bold"
              marginRight="0.5ch"
            >
              {data.ratifiedProposalCount}
            </Box>
            {t('about.labels.ratifiedProposals', {
              count: data.ratifiedProposalCount,
            })}
          </Typography>

          <Typography gutterBottom>
            <Box
              component="span"
              fontFamily="Inter Extra Bold"
              marginRight="0.5ch"
            >
              {data.voteCount}
            </Box>
            {t('about.labels.votesCast', {
              count: data.voteCount,
            })}
          </Typography>

          <Typography>
            <Box
              component="span"
              fontFamily="Inter Extra Bold"
              marginRight="0.5ch"
            >
              {data.groupsCount}
            </Box>
            {t('about.labels.groupsCreated', {
              count: data.groupsCount,
            })}
          </Typography>
        </AccordionDetails>
      </Accordion>
    </>
  );
};

export default About;
