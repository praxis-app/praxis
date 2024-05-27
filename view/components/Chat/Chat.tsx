import { Chat as ChatIcon } from '@mui/icons-material';
import { Box, SxProps, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { NavigationPaths } from '../../constants/shared.constants';
import { ChatFragment } from '../../graphql/chat/fragments/gen/Chat.gen';
import { useIsDesktop } from '../../hooks/shared.hooks';
import { Blurple } from '../../styles/theme';
import { getGroupPath } from '../../utils/group.utils';
import GroupAvatar from '../Groups/GroupAvatar';
import Link from '../Shared/Link';

interface Props {
  chat: ChatFragment;
}

const Chat = ({ chat: { name, group, lastMessageSent } }: Props) => {
  const { t } = useTranslation();
  const isDesktop = useIsDesktop();

  const groupPath = getGroupPath(group?.name || '');
  const groupChatPath = `${groupPath}${NavigationPaths.Chat}`;
  const chatPath = group ? groupChatPath : NavigationPaths.VibeChat;
  const chatName = group ? group.name : name;

  const vibeChatBadgeStyles: SxProps = {
    width: '50px',
    height: '50px',
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: Blurple.Marina,
    borderRadius: '50%',
  };

  const getSubText = () => {
    if (!lastMessageSent) {
      if (group) {
        return group.description;
      }
      return t('chat.prompts.noMessagesYet');
    }
    return `${lastMessageSent.user.name}: ${lastMessageSent.body}`;
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
        <Typography>{chatName}</Typography>
        <Typography
          color="text.secondary"
          display="inline-block"
          overflow="hidden"
          textOverflow="ellipsis"
          whiteSpace="nowrap"
          width={isDesktop ? '330px' : '140px'}
        >
          {getSubText()}
        </Typography>
      </Box>
    </Link>
  );
};

export default Chat;
