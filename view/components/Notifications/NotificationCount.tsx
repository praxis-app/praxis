import { BoxProps, Typography } from '@mui/material';
import { useUnreadNotificationsQuery } from '../../graphql/notifications/queries/gen/UnreadNotifications.gen';
import { useNotifiedSubscription } from '../../graphql/notifications/subscriptions/gen/Notified.gen';
import { Blurple } from '../../styles/theme';
import { addNotification } from '../../utils/cache.utils';
import Flex from '../Shared/Flex';

interface Props extends BoxProps {
  size?: string | number;
}

const NotificationCount = ({
  fontSize = '12px',
  size = '18px',
  ...boxProps
}: Props) => {
  const { data } = useUnreadNotificationsQuery();
  const count = data?.unreadNotificationsCount || 0;

  useNotifiedSubscription({
    onData({ data: { data }, client: { cache } }) {
      if (!data?.notification) {
        return;
      }
      addNotification(cache, data);
    },
  });

  const getCountText = () => {
    if (count > 99) {
      return '99+';
    }
    return count;
  };

  if (count < 1) {
    return null;
  }

  return (
    <Flex
      bgcolor={Blurple.Marina}
      height={size}
      minWidth={size}
      width="fit-content"
      position="absolute"
      alignItems="center"
      justifyContent="center"
      paddingLeft={count > 99 ? '2px' : 0}
      borderRadius="9999px"
      bottom="13px"
      left="10px"
      {...boxProps}
    >
      <Typography
        color="primary"
        fontFamily="Inter Medium"
        fontSize={fontSize}
        paddingX="4px"
      >
        {getCountText()}
      </Typography>
    </Flex>
  );
};

export default NotificationCount;
