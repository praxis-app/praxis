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

  const username = data?.user.displayName || name;
  const truncatedUsername = truncate(username, {
    length: isDesktop ? TruncationSizes.Medium : TruncationSizes.Small,
  });

  const breadcrumbs = [
    {
      label: truncatedUsername,
      href: getUserProfilePath(name),
    },
    {
      label: data
        ? t('users.labels.following', {
            count: data.user.followingCount,
          })
        : t('pagination.loading'),
    },
  ];

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

  return (
    <>
      <Breadcrumbs breadcrumbs={breadcrumbs} sx={{ marginBottom: 0.25 }} />

      <Pagination
        count={data?.user.followingCount}
        isLoading={loading}
        onChangePage={onChangePage}
        page={page}
        rowsPerPage={rowsPerPage}
        setPage={setPage}
        setRowsPerPage={setRowsPerPage}
        sx={{ marginBottom: 0.5 }}
      >
        {!!data?.user.followingCount && (
          <Card>
            <CardContent>
              {data.user.following.map((followedUser) => (
                <Follow
                  key={followedUser.id}
                  currentUserId={data.me.id}
                  user={followedUser}
                />
              ))}
            </CardContent>
          </Card>
        )}
      </Pagination>
    </>
  );
};

export default Following;
