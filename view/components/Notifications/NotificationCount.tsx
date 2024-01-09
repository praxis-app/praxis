import { BoxProps, Typography } from '@mui/material';
import { useUnreadNotificationsQuery } from '../../graphql/notifications/queries/gen/UnreadNotifications.gen';
import { useNotifiedSubscription } from '../../graphql/notifications/subscriptions/gen/Notified.gen';
import { Blurple } from '../../styles/theme';
import { addNotification } from '../../utils/cache.utils';
import Flex from '../Shared/Flex';

const NotificationCount = (boxProps: BoxProps) => {
  const { data } = useUnreadNotificationsQuery();
  const count = data?.unreadNotificationsCount;

  useNotifiedSubscription({
    onData({ data: { data }, client: { cache } }) {
      if (!data?.notification) {
        return;
      }
      addNotification(cache, data);
    },
  });

  const getCountText = () => {
    if (!count) {
      return;
    }
    if (count > 99) {
      return '99+';
    }
    return count;
  };

  if (!count) {
    return null;
  }

  return (
    <Flex
      bgcolor={Blurple.Marina}
      height="18px"
      minWidth="18px"
      width="fit-content"
      position="absolute"
      alignItems="center"
      justifyContent="center"
      borderRadius="9999px"
      bottom="13px"
      left="10px"
      // paddingLeft="2px" // TODO: Include conditionally
      {...boxProps}
    >
      <Typography fontSize="12px" color="primary" paddingX="4px">
        {getCountText()}
      </Typography>
    </Flex>
  );
};

export default NotificationCount;
