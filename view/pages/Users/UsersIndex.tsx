import { Card, CardContent, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import LevelOneHeading from '../../components/Shared/LevelOneHeading';
import Pagination from '../../components/Shared/Pagination';
import Follow from '../../components/Users/Follow';
import { DEFAULT_PAGE_SIZE } from '../../constants/shared.constants';
import { useUsersLazyQuery } from '../../graphql/users/queries/gen/Users.gen';
import { isDeniedAccess } from '../../utils/error.utils';

const UsersIndex = () => {
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PAGE_SIZE);
  const [page, setPage] = useState(0);

  const [getUsers, { data, loading, error }] = useUsersLazyQuery();

  const { t } = useTranslation();

  useEffect(() => {
    getUsers({
      variables: {
        limit: rowsPerPage,
        offset: page * rowsPerPage,
      },
    });
  }, [getUsers, rowsPerPage, page]);

  const onChangePage = async (newPage: number) => {
    await getUsers({
      variables: {
        limit: rowsPerPage,
        offset: newPage * rowsPerPage,
      },
    });
  };

  if (isDeniedAccess(error)) {
    return <Typography>{t('prompts.permissionDenied')}</Typography>;
  }
  if (error) {
    return <Typography>{t('errors.somethingWentWrong')}</Typography>;
  }

  return (
    <>
      <LevelOneHeading header>{t('navigation.members')}</LevelOneHeading>

      <Pagination
        count={data?.users.totalCount}
        isLoading={loading}
        onChangePage={onChangePage}
        page={page}
        rowsPerPage={rowsPerPage}
        setPage={setPage}
        setRowsPerPage={setRowsPerPage}
        sx={{ marginBottom: 0.75 }}
      >
        {data && (
          <Card>
            <CardContent>
              {data.users.nodes.map((user) => (
                <Follow key={user.id} currentUserId={data.me.id} user={user} />
              ))}
            </CardContent>
          </Card>
        )}
      </Pagination>
    </>
  );
};

export default UsersIndex;
