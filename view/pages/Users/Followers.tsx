import {
  Card,
  CardContent as MuiCardContent,
  styled,
  Typography,
} from '@mui/material';
import { truncate } from 'lodash';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useFollowersLazyQuery } from '../../apollo/users/generated/Followers.query';
import Breadcrumbs from '../../components/Shared/Breadcrumbs';
import ProgressBar from '../../components/Shared/ProgressBar';
import Follow from '../../components/Users/Follow';
import { TruncationSizes } from '../../constants/shared.constants';
import { useIsDesktop } from '../../hooks/shared.hooks';
import { getUserProfilePath } from '../../utils/user.utils';

const CardContent = styled(MuiCardContent)(() => ({
  '&:last-child': {
    paddingBottom: 16,
  },
}));

const Followers = () => {
  const [getFollowers, { data, loading, error }] = useFollowersLazyQuery({});

  const { name } = useParams();
  const { t } = useTranslation();
  const isDesktop = useIsDesktop();

  const user = data?.user;
  const me = data?.me;

  useEffect(() => {
    if (name) {
      getFollowers({
        variables: { name },
      });
    }
  }, [name, getFollowers]);

  if (error) {
    return <Typography>{t('errors.somethingWentWrong')}</Typography>;
  }

  if (loading) {
    return <ProgressBar />;
  }

  if (!me || !user) {
    return null;
  }

  const breadcrumbs = [
    {
      label: truncate(name, {
        length: isDesktop ? TruncationSizes.Small : TruncationSizes.ExtraSmall,
      }),
      href: getUserProfilePath(name),
    },
    {
      label: t('users.labels.followers', {
        count: user.followerCount,
      }),
    },
  ];

  return (
    <>
      <Breadcrumbs breadcrumbs={breadcrumbs} />

      {!!user.followerCount && (
        <Card>
          <CardContent>
            {user.followers.map((follower) => (
              <Follow user={follower} currentUserId={me.id} key={follower.id} />
            ))}
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default Followers;
