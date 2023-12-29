import {
  Card,
  CardContent as MuiCardContent,
  styled,
  Typography,
} from '@mui/material';
import { truncate } from 'lodash';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import Breadcrumbs from '../../components/Shared/Breadcrumbs';
import Pagination from '../../components/Shared/Pagination';
import ProgressBar from '../../components/Shared/ProgressBar';
import Follow from '../../components/Users/Follow';
import {
  DEFAULT_PAGE_SIZE,
  TruncationSizes,
} from '../../constants/shared.constants';
import { useFollowingLazyQuery } from '../../graphql/users/queries/gen/Following.gen';
import { useIsDesktop } from '../../hooks/shared.hooks';
import { getUserProfilePath } from '../../utils/user.utils';

const CardContent = styled(MuiCardContent)(() => ({
  '&:last-child': {
    paddingBottom: 16,
  },
}));

const Following = () => {
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PAGE_SIZE);
  const [page, setPage] = useState(0);

  const [getFollowing, { data, loading, error }] = useFollowingLazyQuery({});

  const { name } = useParams();
  const { t } = useTranslation();
  const isDesktop = useIsDesktop();

  const user = data?.user;
  const me = data?.me;

  useEffect(() => {
    if (name) {
      getFollowing({
        variables: {
          name,
          limit: rowsPerPage,
          offset: page * rowsPerPage,
        },
      });
    }
  }, [name, getFollowing, rowsPerPage, page]);

  const onChangePage = async (newPage: number) => {
    if (!name) {
      return;
    }
    await getFollowing({
      variables: {
        name,
        limit: rowsPerPage,
        offset: newPage * rowsPerPage,
      },
    });
  };

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
      <Breadcrumbs breadcrumbs={breadcrumbs} sx={{ marginBottom: 0.25 }} />

      {!!user.followingCount && (
        <Pagination
          count={data?.user.following.totalCount || 0}
          isLoading={loading}
          onChangePage={onChangePage}
          page={page}
          rowsPerPage={rowsPerPage}
          setPage={setPage}
          setRowsPerPage={setRowsPerPage}
          sx={{ marginBottom: 0.5 }}
        >
          <Card>
            <CardContent>
              {user.following.nodes.map((followedUser) => (
                <Follow
                  key={followedUser.id}
                  currentUserId={me.id}
                  user={followedUser}
                />
              ))}
            </CardContent>
          </Card>
        </Pagination>
      )}
    </>
  );
};

export default Following;
