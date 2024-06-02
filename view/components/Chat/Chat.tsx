import { Chat as ChatIcon } from '@mui/icons-material';
import { Box, SxProps } from '@mui/material';
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

  const renderSubText = () => {
    const mobileWidth = unreadMessageCount ? '210px' : '225px';
    const desktopWidth = unreadMessageCount ? '450px' : '480px';

    if (!lastMessageSent?.body) {
      if (group?.description) {
        return (
          <Box
            overflow="hidden"
            textOverflow="ellipsis"
            whiteSpace="nowrap"
            maxWidth={isDesktop ? desktopWidth : mobileWidth}
          >
            {group.description}
          </Box>
        );
      }
      return <Box>{t('chat.prompts.noMessagesYet')}</Box>;
    }

    // Get truncated username
    const { user } = lastMessageSent;
    const userName = user.displayName || user.name;
    const truncatedName = truncate(userName, {
      length: isDesktop ? TruncationSizes.Small : TruncationSizes.ExtraSmall,
    });

    return (
      <Flex maxWidth={isDesktop ? desktopWidth : mobileWidth}>
        <Box whiteSpace="nowrap">{truncatedName}</Box>
        <Box paddingRight="0.5ch">:</Box>
        <Box overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
          {lastMessageSent.body}
        </Box>
      </Flex>
    );
  };

  return (
    <Flex
      gap="12px"
      alignItems="center"
      onClick={() => navigate(chatPath)}
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
        <Flex color="text.secondary">
          <Box
            paddingRight="0.5ch"
            fontFamily={unreadMessageCount ? 'Inter Bold' : undefined}
            color={unreadMessageCount ? 'text.primary' : undefined}
          >
            {renderSubText()}
          </Box>
          <Box>{`${MIDDOT_WITH_SPACES}${formattedDate}`}</Box>
        </Flex>
      </Box>

      {unreadMessageCount > 0 && (
        <Box
          bgcolor={Blurple.Marina}
          borderRadius="50%"
          minWidth="12px"
          minHeight="12px"
        />
      )}
    </Flex>
  );
};

export default Chat;
