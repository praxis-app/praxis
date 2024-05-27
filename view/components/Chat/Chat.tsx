import { Typography } from '@mui/material';
import { NavigationPaths } from '../../constants/shared.constants';
import { ChatFragment } from '../../graphql/chat/fragments/gen/Chat.gen';
import { getGroupPath } from '../../utils/group.utils';
import Link from '../Shared/Link';

interface Props {
  chat: ChatFragment;
}

const Chat = ({ chat: { name, group } }: Props) => {
  const groupPath = getGroupPath(group?.name || '');
  const groupChatPath = `${groupPath}${NavigationPaths.Chat}`;
  const chatPath = group ? groupChatPath : NavigationPaths.VibeChat;

  return (
    <Link href={chatPath}>
      <Typography>{name}</Typography>
    </Link>
  );
};

export default Chat;
