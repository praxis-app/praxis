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
import { useFollowersLazyQuery } from '../../graphql/users/queries/gen/Followers.gen';
import { useIsDesktop } from '../../hooks/shared.hooks';
import { getUserProfilePath } from '../../utils/user.utils';

const CardContent = styled(MuiCardContent)(() => ({
  '&:last-child': {
    paddingBottom: 16,
  },
}));

const Followers = () => {
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PAGE_SIZE);
  const [page, setPage] = useState(0);

  const [getFollowers, { data, loading, error }] = useFollowersLazyQuery();

  const { name } = useParams();
  const { t } = useTranslation();
  const isDesktop = useIsDesktop();

  useEffect(() => {
    if (name) {
      getFollowers({
        variables: {
          name,
          limit: rowsPerPage,
          offset: page * rowsPerPage,
        },
      });
    }
  }, [name, getFollowers, rowsPerPage, page]);

  const onChangePage = async (newPage: number) => {
    if (!name) {
      return;
    }
    await getFollowers({
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

  const breadcrumbs = [
    {
      label: truncate(name, {
        length: isDesktop ? TruncationSizes.Small : TruncationSizes.ExtraSmall,
      }),
      href: getUserProfilePath(name),
    },
    {
      label: data
        ? t('users.labels.followers', {
            count: data.user.followerCount,
          })
        : t('pagination.loading'),
    },
  ];

  return (
    <>
      <Breadcrumbs breadcrumbs={breadcrumbs} sx={{ marginBottom: 0.25 }} />

      <Pagination
        count={data?.user.followers.totalCount}
        isLoading={loading}
        onChangePage={onChangePage}
        page={page}
        rowsPerPage={rowsPerPage}
        setPage={setPage}
        setRowsPerPage={setRowsPerPage}
        sx={{ marginBottom: 0.5 }}
      >
        {!!data?.user.followerCount && (
          <Card>
            <CardContent>
              {data.user.followers.nodes.map((follower) => (
                <Follow
                  key={follower.id}
                  currentUserId={data.me.id}
                  user={follower}
                />
              ))}
            </CardContent>
          </Card>
        )}
      </Pagination>
    </>
  );
};

export default Followers;
