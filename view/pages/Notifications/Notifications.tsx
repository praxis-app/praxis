import { Check, Delete } from '@mui/icons-material';
import {
  Card,
  Divider,
  MenuItem,
  CardContent as MuiCardContent,
  Typography,
  styled,
} from '@mui/material';
import { produce } from 'immer';
import { Fragment, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Notification from '../../components/Notifications/Notification';
import Center from '../../components/Shared/Center';
import Flex from '../../components/Shared/Flex';
import ItemMenu from '../../components/Shared/ItemMenu';
import LevelOneHeading from '../../components/Shared/LevelOneHeading';
import Pagination from '../../components/Shared/Pagination';
import ProgressBar from '../../components/Shared/ProgressBar';
import { NotificationStatus } from '../../constants/notifications.constants';
import { DEFAULT_PAGE_SIZE } from '../../constants/shared.constants';
import { useBulkUpdateNotificationsMutation } from '../../graphql/notifications/mutations/gen/BulkUpdateNotifications.gen';
import { useClearNotificationMutation } from '../../graphql/notifications/mutations/gen/ClearNotifications.gen';
import {
  NotificationsDocument,
  NotificationsQuery,
  useNotificationsLazyQuery,
} from '../../graphql/notifications/queries/gen/Notifications.gen';
import {
  UnreadNotificationsDocument,
  UnreadNotificationsQuery,
} from '../../graphql/notifications/queries/gen/UnreadNotifications.gen';
import { isDeniedAccess } from '../../utils/error.utils';
import { ApolloCache } from '@apollo/client';

const CardContent = styled(MuiCardContent)(() => ({
  '&:last-child': {
    paddingBottom: 18,
  },
}));

const Notifications = () => {
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PAGE_SIZE);
  const [page, setPage] = useState(0);

  const [
    getNotifications,
    { data, loading: notificationsLoading, error: notificationsError },
  ] = useNotificationsLazyQuery();

  const [
    bulkUpdateNotifications,
    { loading: bulkUpdateLoading, error: bulkUpdateError },
  ] = useBulkUpdateNotificationsMutation();

  const [
    clearNotifications,
    { loading: clearNotificationsLoading, error: clearNotificationsErro },
  ] = useClearNotificationMutation();

  const { t } = useTranslation();

  const error = notificationsError || bulkUpdateError || clearNotificationsErro;

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

  const resetUnreadCount = (cache: ApolloCache<any>) => {
    cache.updateQuery<UnreadNotificationsQuery>(
      { query: UnreadNotificationsDocument },
      (notificationsData) =>
        produce(notificationsData, (draft) => {
          if (!draft) {
            return;
          }
          draft.unreadNotificationsCount = 0;
        }),
    );
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
      update: resetUnreadCount,
    });
    setMenuAnchorEl(null);
  };

  const handleClearAll = async () => {
    await clearNotifications({
      update(cache) {
        cache.updateQuery<NotificationsQuery>(
          {
            query: NotificationsDocument,
            variables: { limit: 10, offset: 0 },
          },
          (notificationsData) =>
            produce(notificationsData, (draft) => {
              if (!draft) {
                return;
              }
              draft.notifications = [];
              draft.notificationsCount = 0;
            }),
        );
        resetUnreadCount(cache);
      },
    });
    setMenuAnchorEl(null);
  };

  const handleClearAllWithConfirm = () =>
    window.confirm(t('notifications.prompts.confirmClearAll')) &&
    handleClearAll();

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

        <ItemMenu
          anchorEl={menuAnchorEl}
          buttonStyles={{ marginBottom: '24px', width: '72px' }}
          deleteBtnLabel={t('notifications.labels.delete')}
          deletePrompt={t('notifications.prompts.confirmDelete')}
          loading={bulkUpdateLoading || clearNotificationsLoading}
          setAnchorEl={setMenuAnchorEl}
          variant="ghost"
          prependChildren
          canDelete
        >
          <MenuItem onClick={handleBulkUpdate}>
            <Check fontSize="small" sx={{ marginRight: 1 }} />
            {t('notifications.labels.markAllAsRead')}
          </MenuItem>
          <MenuItem onClick={handleClearAllWithConfirm}>
            <Delete fontSize="small" sx={{ marginRight: 1 }} />
            {t('notifications.labels.clearAll')}
          </MenuItem>
        </ItemMenu>
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
