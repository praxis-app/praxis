import { ApolloCache } from '@apollo/client';
import { Check, Delete } from '@mui/icons-material';
import { Card, MenuItem, Typography } from '@mui/material';
import { produce } from 'immer';
import { useEffect, useState } from 'react';
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
import { useClearNotificationMutation } from '../../graphql/notifications/mutations/gen/ClearNotifications.gen';
import { useReadNotificationsMutation } from '../../graphql/notifications/mutations/gen/ReadNotifications.gen';
import {
  NotificationsDocument,
  NotificationsQuery,
  NotificationsQueryVariables,
  useNotificationsLazyQuery,
} from '../../graphql/notifications/queries/gen/Notifications.gen';
import {
  UnreadNotificationsDocument,
  UnreadNotificationsQuery,
} from '../../graphql/notifications/queries/gen/UnreadNotifications.gen';
import { isDeniedAccess } from '../../utils/error.utils';

const Notifications = () => {
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PAGE_SIZE);
  const [page, setPage] = useState(0);

  const [
    getNotifications,
    { data, loading: notificationsLoading, error: notificationsError },
  ] = useNotificationsLazyQuery();

  const [
    readNotifications,
    { loading: readNotificationsLoading, error: readNotificationsError },
  ] = useReadNotificationsMutation();

  const [
    clearNotifications,
    { loading: clearNotificationsLoading, error: clearNotificationsError },
  ] = useClearNotificationMutation();

  const { t } = useTranslation();

  const error =
    notificationsError || readNotificationsError || clearNotificationsError;

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

  const handleReadNotifications = async () => {
    if (!data) {
      return;
    }
    await readNotifications({
      update(cache) {
        const pageCount = Math.ceil(data.notificationsCount / rowsPerPage);
        for (let i = 0; i < pageCount; i++) {
          cache.updateQuery<NotificationsQuery, NotificationsQueryVariables>(
            {
              query: NotificationsDocument,
              variables: {
                limit: rowsPerPage,
                offset: i * rowsPerPage,
              },
            },
            (notificationsData) =>
              produce(notificationsData, (draft) => {
                if (!draft) {
                  return;
                }
                draft.notifications.forEach((notification) => {
                  notification.status = NotificationStatus.Read;
                });
              }),
          );
        }
        resetUnreadCount(cache);
      },
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
          loading={readNotificationsLoading || clearNotificationsLoading}
          setAnchorEl={setMenuAnchorEl}
          variant="ghost"
          prependChildren
          canDelete
        >
          <MenuItem onClick={handleReadNotifications}>
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
          {data?.notifications.map((notification, index) => (
            <Notification
              key={notification.id}
              notification={notification}
              isFirst={index === 0}
              isLast={index === data.notifications.length - 1}
            />
          ))}

          {data?.notifications.length === 0 && (
            <Center marginY="35px">
              <Typography>
                {t('notifications.prompts.noNotifications')}
              </Typography>
            </Center>
          )}
        </Card>
      </Pagination>
    </>
  );
};

export default Notifications;
