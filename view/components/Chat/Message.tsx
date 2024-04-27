import { Box, Typography } from '@mui/material';
import { MessageFragment } from '../../graphql/chat/fragments/gen/Message.gen';
import { urlifyText } from '../../utils/shared.utils';
import { timeAgo } from '../../utils/time.utils';
import { getUserProfilePath } from '../../utils/user.utils';
import Flex from '../Shared/Flex';
import Link from '../Shared/Link';
import UserAvatar from '../Users/UserAvatar';

interface Props {
  message: MessageFragment;
}

const Message = ({ message: { user, body, createdAt } }: Props) => {
  const userName = user.displayName || user.name;
  const userPath = getUserProfilePath(user.name);
  const formattedDate = timeAgo(createdAt);

  return (
    <Flex gap={2} paddingBottom={2}>
      <UserAvatar user={user} sx={{ marginTop: 0.5 }} withLink />

      <Box>
        <Flex gap={1}>
          <Link href={userPath}>
            <Typography fontFamily="Inter Bold">{userName}</Typography>
          </Link>
          <Typography
            color="text.secondary"
            sx={{ cursor: 'default' }}
            title={formattedDate}
          >
            {formattedDate}
          </Typography>
        </Flex>

        {body && (
          <Typography
            dangerouslySetInnerHTML={{ __html: urlifyText(body) }}
            whiteSpace="pre-wrap"
            lineHeight={1.2}
            paddingBottom={0.4}
          />
        )}
      </Box>
    </Flex>
  );
};

export default Message;
