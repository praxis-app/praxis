import {
  Button,
  Card,
  Divider,
  CardContent as MuiCardContent,
  Typography,
  styled,
} from '@mui/material';
import { Fragment, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Notification from '../../components/Notifications/Notification';
import Center from '../../components/Shared/Center';
import Flex from '../../components/Shared/Flex';
import LevelOneHeading from '../../components/Shared/LevelOneHeading';
import Pagination from '../../components/Shared/Pagination';
import ProgressBar from '../../components/Shared/ProgressBar';
import Spinner from '../../components/Shared/Spinner';
import { NotificationStatus } from '../../constants/notifications.constants';
import { DEFAULT_PAGE_SIZE } from '../../constants/shared.constants';
import { useBulkUpdateNotificationsMutation } from '../../graphql/notifications/mutations/gen/BulkUpdateNotifications.gen';
import { useNotificationsLazyQuery } from '../../graphql/notifications/queries/gen/Notifications.gen';
import { isDeniedAccess } from '../../utils/error.utils';

const CardContent = styled(MuiCardContent)(() => ({
  '&:last-child': {
    paddingBottom: 18,
  },
}));

const Notifications = () => {
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PAGE_SIZE);
  const [page, setPage] = useState(0);

  const [getNotifications, { data, loading: notificationsLoading, error }] =
    useNotificationsLazyQuery();

  const [bulkUpdateNotifications, { loading: bulkUpdateLoading }] =
    useBulkUpdateNotificationsMutation();

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

  const handleBulkUpdate = async () => {
    if (!data) {
      return;
    }
    await bulkUpdateNotifications({
      variables: {
        notificationsData: {
          ids: data.notifications.map((notification) => notification.id),
          status: NotificationStatus.Read,
        },
      },
    });
  };

  if (isDeniedAccess(error)) {
    return <Typography>{t('prompts.permissionDenied')}</Typography>;
  }
  if (error) {
    return <Typography>{t('errors.somethingWentWrong')}</Typography>;
  }
  if (notificationsLoading) {
    return <ProgressBar />;
  }

  return (
    <>
      <Flex justifyContent="space-between" alignItems="center">
        <LevelOneHeading header>{t('navigation.activity')}</LevelOneHeading>

        <Button
          sx={{ marginBottom: '24px', textTransform: 'none' }}
          startIcon={bulkUpdateLoading ? <Spinner size={10} /> : null}
          onClick={handleBulkUpdate}
        >
          {t('notifications.labels.markAllAsRead')}
        </Button>
      </Flex>

      <Pagination
        count={data?.notificationsCount}
        onChangePage={onChangePage}
        page={page}
        rowsPerPage={rowsPerPage}
        setPage={setPage}
        setRowsPerPage={setRowsPerPage}
        sx={{ marginBottom: 0.75 }}
        showTopPagination={false}
      >
        <Card>
          <CardContent>
            {data?.notifications.map((notification, index) => (
              <Fragment key={notification.id}>
                <Notification notification={notification} />

                {index !== data?.notifications.length - 1 && (
                  <Divider sx={{ marginY: 1.75 }} />
                )}
              </Fragment>
            ))}

            {data?.notifications.length === 0 && (
              <Center marginTop="13px" marginBottom="10px">
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

export default Notifications;
