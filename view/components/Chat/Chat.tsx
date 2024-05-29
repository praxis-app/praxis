import { Chat as ChatIcon } from '@mui/icons-material';
import { Box, SxProps, Typography } from '@mui/material';
import { truncate } from 'lodash';
import { useTranslation } from 'react-i18next';
import {
  MIDDOT_WITH_SPACES,
  NavigationPaths,
  TruncationSizes,
} from '../../constants/shared.constants';
import { ChatFragment } from '../../graphql/chat/fragments/gen/Chat.gen';
import { useIsDesktop } from '../../hooks/shared.hooks';
import { Blurple } from '../../styles/theme';
import { getGroupPath } from '../../utils/group.utils';
import { timeAgo } from '../../utils/time.utils';
import GroupAvatar from '../Groups/GroupAvatar';
import Link from '../Shared/Link';

interface Props {
  chat: ChatFragment;
}

const Chat = ({
  chat: { name, group, lastMessageSent, createdAt, unreadMessageCount },
}: Props) => {
  const { t } = useTranslation();
  const isDesktop = useIsDesktop();

  const groupPath = getGroupPath(group?.name || '');
  const groupChatPath = `${groupPath}${NavigationPaths.Chat}`;
  const chatPath = group ? groupChatPath : NavigationPaths.VibeChat;

  const chatName = group ? group.name : name;
  const lastUpdatedAt = lastMessageSent?.createdAt || createdAt;
  const formattedDate = timeAgo(lastUpdatedAt);

  const vibeChatBadgeStyles: SxProps = {
    width: '50px',
    height: '50px',
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: Blurple.Marina,
    borderRadius: '50%',
  };

  const getSubText = () => {
    if (!lastMessageSent?.body) {
      if (group?.description) {
        const truncatedDescription = truncate(group.description, {
          length: isDesktop ? TruncationSizes.Large : 30,
        });
        return truncatedDescription;
      }
      return t('chat.prompts.noMessagesYet');
    }
    const { user } = lastMessageSent;
    const userName = user.displayName || user.name;
    const truncatedName = truncate(userName, {
      length: isDesktop ? TruncationSizes.Small : TruncationSizes.ExtraSmall,
    });
    const truncatedBody = truncate(lastMessageSent.body, {
      length: isDesktop ? TruncationSizes.Medium : TruncationSizes.ExtraSmall,
    });
    return `${truncatedName}: ${truncatedBody}`;
  };

  return (
    <Link
      href={chatPath}
      sx={{ display: 'flex', gap: '12px', alignItems: 'center' }}
    >
      {group ? (
        <GroupAvatar
          group={group}
          withLink={false}
          sx={{ width: '50px', height: '50px' }}
        />
      ) : (
        <Box sx={vibeChatBadgeStyles}>
          <ChatIcon sx={{ alignSelf: 'center', marginTop: 0.35 }} />
        </Box>
      )}

      <Box alignSelf="center" paddingTop={0.9}>
        <Typography
          fontFamily={unreadMessageCount ? 'Inter Bold' : 'Inter Medium'}
        >
          {chatName}
        </Typography>
        <Typography color="text.secondary">
          <Box
            component="span"
            fontFamily={unreadMessageCount ? 'Inter Bold' : undefined}
            color={unreadMessageCount ? 'text.primary' : undefined}
          >
            {getSubText()}
          </Box>
          <Box component="span">{`${MIDDOT_WITH_SPACES}${formattedDate}`}</Box>
        </Typography>
      </Box>
    </Link>
  );
};

export default Chat;
