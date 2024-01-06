import { Typography } from '@mui/material';
import { t } from 'i18next';
import { useState } from 'react';
import { Namespace, TFunction } from 'react-i18next';
import { NotificationActionType } from '../../constants/notifications.constants';
import { NotificationFragment } from '../../graphql/notifications/fragments/gen/Notification.gen';
import { useDeleteNotificationMutation } from '../../graphql/notifications/mutations/gen/DeleteNotification.gen';
import Flex from '../Shared/Flex';
import ItemMenu from '../Shared/ItemMenu';

interface Props {
  notification: NotificationFragment;
}

const Notification = ({
  notification: { id, actionType, otherUser },
}: Props) => {
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);

  const [deleteNotification] = useDeleteNotificationMutation();

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

  const handleDelete = () => {
    deleteNotification({ variables: { id } });
  };

  return (
    <Flex alignItems="center" justifyContent="space-between">
      <Typography
        dangerouslySetInnerHTML={{
          __html: getNotificationMessage(actionType, otherUser?.name),
        }}
      />

      <ItemMenu
        anchorEl={menuAnchorEl}
        deleteItem={handleDelete}
        deletePrompt={t('notifications.prompts.confirmDelete')}
        setAnchorEl={setMenuAnchorEl}
        canDelete
      />
    </Flex>
  );
};

export default Notification;
