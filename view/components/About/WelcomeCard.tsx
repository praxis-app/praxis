import { useReactiveVar } from '@apollo/client';
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { NavigationPaths } from '../../constants/shared.constants';
import {
  inviteTokenVar,
  isLoggedInVar,
  isVerifiedVar,
} from '../../graphql/cache';
import { useIsFirstUserQuery } from '../../graphql/users/queries/gen/IsFirstUser.gen';

const WelcomeCard = () => {
  const inviteToken = useReactiveVar(inviteTokenVar);
  const isLoggedIn = useReactiveVar(isLoggedInVar);
  const isVerified = useReactiveVar(isVerifiedVar);

  const { data } = useIsFirstUserQuery({
    skip: isLoggedIn,
  });

  const { t } = useTranslation();
  const navigate = useNavigate();

  const signUpPath = data?.isFirstUser
    ? NavigationPaths.SignUp
    : `${NavigationPaths.SignUp}/${inviteToken}`;

  return (
    <Card>
      <CardHeader
        title={t('prompts.welcomeToPraxis')}
        sx={{ paddingBottom: 0.75 }}
      />

      <CardContent>
        <Typography sx={{ marginBottom: 1.5 }}>
          {t('about.welcomeCard.projectDescription1')}
        </Typography>

        <Typography sx={{ marginBottom: 3 }}>
          {t('about.welcomeCard.projectDescription2')}
        </Typography>

        <Typography>{t('about.welcomeCard.inDev')}</Typography>
      </CardContent>

      <CardActions>
        {inviteToken && (
          <Button onClick={() => navigate(signUpPath)}>
            {t('users.actions.signUp')}
          </Button>
        )}

        {isLoggedIn && !isVerified && (
          <Button onClick={() => navigate(NavigationPaths.MyVibeCheck)}>
            {t('users.actions.getVerified')}
          </Button>
        )}

        {!isLoggedIn && !inviteToken && (
          <Button onClick={() => navigate(NavigationPaths.Groups)}>
            {t('groups.headers.exploreGroups')}
          </Button>
        )}

        <Button onClick={() => navigate(NavigationPaths.Docs)}>
          {t('about.actions.learnMore')}
        </Button>
      </CardActions>
    </Card>
  );
};

export default WelcomeCard;
