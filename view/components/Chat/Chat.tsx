import { Box, SxProps, Typography } from '@mui/material';
import { Chat as ChatIcon } from '@mui/icons-material';
import { NavigationPaths } from '../../constants/shared.constants';
import { ChatFragment } from '../../graphql/chat/fragments/gen/Chat.gen';
import { getGroupPath } from '../../utils/group.utils';
import Link from '../Shared/Link';
import GroupAvatar from '../Groups/GroupAvatar';
import { Blurple } from '../../styles/theme';

interface Props {
  chat: ChatFragment;
}

const Chat = ({ chat: { name, group } }: Props) => {
  const groupPath = getGroupPath(group?.name || '');
  const groupChatPath = `${groupPath}${NavigationPaths.Chat}`;
  const chatPath = group ? groupChatPath : NavigationPaths.VibeChat;
  const chatName = group ? group.name : name;

  const vibeChatBadgeStyles: SxProps = {
    width: '40px',
    height: '40px',
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: Blurple.Marina,
    borderRadius: '50%',
  };

  return (
    <Link href={chatPath} sx={{ display: 'flex', gap: '12px' }}>
      {group ? (
        <GroupAvatar group={group} withLink={false} />
      ) : (
        <Box sx={vibeChatBadgeStyles}>
          <ChatIcon sx={{ alignSelf: 'center', marginTop: 0.35 }} />
        </Box>
      )}

      <Typography alignSelf="center">{chatName}</Typography>
    </Link>
  );
};

export default Chat;
