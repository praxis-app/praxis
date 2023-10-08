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
import { useFollowingLazyQuery } from '../../apollo/users/generated/Following.query';
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

const Following = () => {
  const [getFollowing, { data, loading, error }] = useFollowingLazyQuery({});

  const { name } = useParams();
  const { t } = useTranslation();
  const isDesktop = useIsDesktop();

  const user = data?.user;
  const me = data?.me;

  useEffect(() => {
    if (name) {
      getFollowing({
        variables: { name },
      });
    }
  }, [name, getFollowing]);

  if (error) {
    return <Typography>{t('errors.somethingWentWrong')}</Typography>;
  }
  if (loading) {
    return <ProgressBar />;
  }
  if (!user || !me) {
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
      label: t('users.labels.following', {
        count: user.followingCount,
      }),
    },
  ];

  return (
    <>
      <Breadcrumbs breadcrumbs={breadcrumbs} />

      {!!user.followingCount && (
        <Card>
          <CardContent>
            {user.following.map((followedUser) => (
              <Follow
                key={followedUser.id}
                currentUserId={me.id}
                user={followedUser}
              />
            ))}
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default Following;
