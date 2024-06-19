import { useReactiveVar } from '@apollo/client';
import { Box, Button, Divider, Typography } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import ServerRoleView from '../../components/Roles/ServerRoles/ServerRoleView';
import Rule from '../../components/Rules/Rule';
import Accordion, {
  AccordionDetails,
  AccordionSummary,
} from '../../components/Shared/Accordion';
import Flex from '../../components/Shared/Flex';
import FormattedText from '../../components/Shared/FormattedText';
import LevelOneHeading from '../../components/Shared/LevelOneHeading';
import Link from '../../components/Shared/Link';
import ProgressBar from '../../components/Shared/ProgressBar';
import { NavigationPaths } from '../../constants/shared.constants';
import { useAboutQuery } from '../../graphql/about/queries/gen/About.gen';
import {
  inviteTokenVar,
  isAuthDoneVar,
  isLoggedInVar,
  isVerifiedVar,
} from '../../graphql/cache';

const About = () => {
  const [showServerRoles, setShowServerRoles] = useState(false);
  const [showServerRules, setShowServerRules] = useState(true);
  const [showAboutText, setShowAboutText] = useState(true);
  const [showStats, setShowStats] = useState(false);

  const inviteToken = useReactiveVar(inviteTokenVar);
  const isAuthDone = useReactiveVar(isAuthDoneVar);
  const isLoggedIn = useReactiveVar(isLoggedInVar);
  const isVerified = useReactiveVar(isVerifiedVar);

  const { data, loading, error } = useAboutQuery({
    variables: { isVerified },
    skip: !isAuthDone,
  });

  const { t } = useTranslation();
  const navigate = useNavigate();

  const canManageRoles = data?.me?.serverPermissions.manageRoles;
  const serverConfig = data?.serverConfig;
  const serverRules = data?.serverRules;
  const serverRoles = data?.serverRoles;

  const aboutText = serverConfig?.about;
  const serverName = serverConfig?.websiteURL?.replace(
    /^(https?:\/\/)?(www\.)?/,
    '',
  );

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
    <Box paddingBottom={10}>
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
          <FormattedText
            text={aboutText || t('about.prompts.noAboutText')}
            paddingBottom={2.2}
          />

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

        <AccordionDetails sx={{ paddingBottom: 2 }}>
          {isVerified ? (
            <>
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
                  canManageRoles={canManageRoles}
                />
              ))}

              <Divider sx={{ marginBottom: 2.1 }} />

              <Button
                onClick={() => navigate(NavigationPaths.ViewRoles)}
                sx={{ textTransform: 'none' }}
                fullWidth
              >
                {t('about.actions.seeRolesOverview')}
              </Button>
            </>
          ) : (
            <>
              <Typography>
                {inviteToken && (
                  <>
                    <Link
                      href={`${NavigationPaths.SignUp}/${inviteToken}`}
                      sx={{ marginRight: '0.5ch', fontFamily: 'Inter Bold' }}
                    >
                      {t('users.actions.signUp')}
                    </Link>
                    or
                  </>
                )}
                {isLoggedIn ? (
                  <Link
                    href={NavigationPaths.MyVibeCheck}
                    sx={{ fontFamily: 'Inter Bold' }}
                  >
                    {t('users.actions.getVerified')}
                  </Link>
                ) : (
                  <Link
                    href={NavigationPaths.LogIn}
                    sx={{
                      marginLeft: inviteToken ? '0.5ch' : 0,
                      fontFamily: 'Inter Bold',
                    }}
                  >
                    {t('users.actions.logIn')}
                  </Link>
                )}{' '}
                to view roles and permissions
              </Typography>
            </>
          )}
        </AccordionDetails>
      </Accordion>

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
    </Box>
  );
};

export default About;
