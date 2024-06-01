import { useApolloClient } from '@apollo/client';
import { Chat as ChatIcon } from '@mui/icons-material';
import { Box, SxProps } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  MIDDOT_WITH_SPACES,
  NavigationPaths,
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

  const handleClick = () => {
    // TODO: Consider moving this to chat panel
    cache.modify({
      id: cache.identify(chat),
      fields: { unreadMessageCount: () => 0 },
    });
    navigate(chatPath);
  };

  const renderSubText = () => {
    if (!lastMessageSent?.body) {
      if (group?.description) {
        return (
          <Box
            component="span"
            display="inline-block"
            overflow="hidden"
            textOverflow="ellipsis"
            whiteSpace="nowrap"
            maxWidth={isDesktop ? '500px' : '240px'}
          >
            {group.description}
          </Box>
        );
      }

      return (
        <Box component="span" display="inline-block">
          {t('chat.prompts.noMessagesYet')}
        </Box>
      );
    }

    const { user } = lastMessageSent;
    const userName = user.displayName || user.name;

    return (
      <Flex component="span">
        <Box
          component="span"
          display="inline-block"
          overflow="hidden"
          textOverflow="ellipsis"
          whiteSpace="nowrap"
          maxWidth={isDesktop ? '125px' : '90px'}
        >
          {userName}
        </Box>
        <Box component="span" display="inline-block" paddingRight="0.5ch">
          :
        </Box>
        <Box
          component="span"
          display="inline-block"
          overflow="hidden"
          textOverflow="ellipsis"
          whiteSpace="nowrap"
          maxWidth={isDesktop ? '350px' : '120px'}
        >
          {lastMessageSent.body}
        </Box>
      </Flex>
    );
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
        <Box fontFamily={unreadMessageCount ? 'Inter Bold' : 'Inter Medium'}>
          {chatName}
        </Box>
        <Box color="text.secondary">
          <Box
            component="span"
            display="inline-block"
            paddingRight="0.5ch"
            fontFamily={unreadMessageCount ? 'Inter Bold' : undefined}
            color={unreadMessageCount ? 'text.primary' : undefined}
          >
            {renderSubText()}
          </Box>
          <Box
            component="span"
            display="inline-block"
          >{`${MIDDOT_WITH_SPACES}${formattedDate}`}</Box>
        </Box>
      </Box>
    </Flex>
  );
};

export default Chat;
