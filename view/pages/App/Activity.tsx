import { Card, CardContent, Typography } from '@mui/material';
import { Fragment, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Center from '../../components/Shared/Center';
import LevelOneHeading from '../../components/Shared/LevelOneHeading';
import Pagination from '../../components/Shared/Pagination';
import { DEFAULT_PAGE_SIZE } from '../../constants/shared.constants';
import { useNotificationsLazyQuery } from '../../graphql/notifications/queries/gen/Notifications.gen';
import { isDeniedAccess } from '../../utils/error.utils';

const Activity = () => {
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PAGE_SIZE);
  const [page, setPage] = useState(0);

  const [getNotifications, { data, loading, error }] =
    useNotificationsLazyQuery();

  const { t } = useTranslation();

  useEffect(() => {
    getNotifications({
      variables: {
        limit: rowsPerPage,
        offset: page * rowsPerPage,
      },
    });
  }, [getNotifications, rowsPerPage, page]);

  const onChangePage = async (newPage: number) => {
    await getNotifications({
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
      <LevelOneHeading header>{t('navigation.activity')}</LevelOneHeading>

      <Pagination
        count={data?.notificationsCount}
        isLoading={loading}
        onChangePage={onChangePage}
        page={page}
        rowsPerPage={rowsPerPage}
        setPage={setPage}
        setRowsPerPage={setRowsPerPage}
        sx={{ marginBottom: 0.75 }}
      >
        <Card>
          <CardContent>
            {data?.notifications.map((notification) => (
              <Fragment key={notification.id}>{notification.message}</Fragment>
            ))}

            {data?.notifications.length === 0 && (
              <Center marginTop="20px" marginBottom="10px">
                <Typography>
                  {t('notifications.prompts.noNotifications')}
                </Typography>
              </Center>
            )}
          </CardContent>
        </Card>
      </Pagination>
    </>
  );
};

export default Activity;
