import { useReactiveVar } from '@apollo/client';
import {
  Card,
  CardHeader,
  CardContent as MuiCardContent,
  Typography,
  styled,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import Link from '../../components/Shared/Link';
import { NavigationPaths } from '../../constants/shared.constants';
import { inviteTokenVar, isLoggedInVar } from '../../graphql/cache';

const CardContent = styled(MuiCardContent)(() => ({
  '&:last-child': {
    paddingBottom: 18,
  },
}));

const GroupTipsCard = () => {
  const inviteToken = useReactiveVar(inviteTokenVar);
  const isLoggedIn = useReactiveVar(isLoggedInVar);
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader
        title={t('groups.headers.organizeWithGroups')}
        sx={{ paddingBottom: 0.75 }}
      />

      <CardContent>
        <Typography gutterBottom>
          {t('groups.tips.organizeWithGroups')}
        </Typography>
        <Typography gutterBottom>{t('groups.tips.groupProposals')}</Typography>

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
              href={NavigationPaths.VibeCheck}
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
          to explore more groups
        </Typography>
      </CardContent>
    </Card>
  );
};

export default GroupTipsCard;
