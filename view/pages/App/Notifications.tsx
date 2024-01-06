import {
  Card,
  CardContent as MuiCardContent,
  Typography,
  styled,
} from '@mui/material';
import { t } from 'i18next';
import { useEffect, useState } from 'react';
import { Namespace, TFunction, useTranslation } from 'react-i18next';
import Center from '../../components/Shared/Center';
import LevelOneHeading from '../../components/Shared/LevelOneHeading';
import Pagination from '../../components/Shared/Pagination';
import { NotificationActionType } from '../../constants/notifications.constants';
import { DEFAULT_PAGE_SIZE } from '../../constants/shared.constants';
import { useNotificationsLazyQuery } from '../../graphql/notifications/queries/gen/Notifications.gen';
import { isDeniedAccess } from '../../utils/error.utils';

const getNotificationMessage = (actionType: string, name?: string) => {
  const _t: TFunction<Namespace<'ns1'>, undefined> = t;

  if (actionType === NotificationActionType.ProposalVote) {
    return _t('notifications.messages.proposalVote', { name });
  }
  if (actionType === NotificationActionType.ProposalComment) {
    return _t('notifications.messages.proposalComment', { name });
  }
  if (actionType === NotificationActionType.PostComment) {
    return _t('notifications.messages.postComment', { name });
  }
  if (actionType === NotificationActionType.PostLike) {
    return _t('notifications.messages.postLike', { name });
  }
  return _t('notifications.errors.invalidType');
};

const CardContent = styled(MuiCardContent)(() => ({
  '&:last-child': {
    paddingBottom: 18,
  },
}));

const Notifications = () => {
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
            {data?.notifications.map(({ id, actionType, otherUser }) => (
              <Typography
                key={id}
                dangerouslySetInnerHTML={{
                  __html: getNotificationMessage(actionType, otherUser?.name),
                }}
              />
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

export default Notifications;
