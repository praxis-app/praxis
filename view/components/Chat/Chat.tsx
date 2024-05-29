import { useApolloClient } from '@apollo/client';
import { Chat as ChatIcon } from '@mui/icons-material';
import { Box, SxProps, Typography } from '@mui/material';
import { truncate } from 'lodash';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
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
import Flex from '../Shared/Flex';

interface Props {
  chat: ChatFragment;
}

const Chat = ({ chat }: Props) => {
  const { cache } = useApolloClient();
  const { t } = useTranslation();
  const isDesktop = useIsDesktop();
  const navigate = useNavigate();

  const { name, group, lastMessageSent, createdAt, unreadMessageCount } = chat;

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
          length: isDesktop ? TruncationSizes.Medium : TruncationSizes.Small,
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

  const handleClick = () => {
    // TODO: Consider moving this to chat panel
    cache.modify({
      id: cache.identify(chat),
      fields: { unreadMessageCount: () => 0 },
    });
    navigate(chatPath);
  };

  return (
    <Flex
      gap="12px"
      alignItems="center"
      onClick={handleClick}
      sx={{ cursor: 'pointer' }}
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
    </Flex>
  );
};

export default Chat;
