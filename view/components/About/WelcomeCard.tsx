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
import { inviteTokenVar, isLoggedInVar } from '../../apollo/cache';
import { useIsFirstUserQuery } from '../../apollo/users/generated/IsFirstUser.query';
import { NavigationPaths } from '../../constants/shared.constants';
import Link from '../Shared/Link';

const WelcomeCard = () => {
  const inviteToken = useReactiveVar(inviteTokenVar);
  const isLoggedIn = useReactiveVar(isLoggedInVar);
  const { data } = useIsFirstUserQuery({ skip: isLoggedIn });

  const { t } = useTranslation();

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
        <Typography sx={{ marginBottom: 3 }}>
          {t('about.welcomeCard.projectDescription')}
        </Typography>

        <Typography>{t('about.welcomeCard.inDev')}</Typography>
      </CardContent>

      {inviteToken && (
        <CardActions>
          <Link href={signUpPath}>
            <Button sx={{ color: 'text.primary' }}>
              {t('users.actions.signUp')}
            </Button>
          </Link>
        </CardActions>
      )}
    </Card>
  );
};

export default WelcomeCard;
