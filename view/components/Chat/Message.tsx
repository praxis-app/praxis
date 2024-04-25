import { MessageFragment } from '../../graphql/chat/fragments/gen/Message.gen';

interface Props {
  message: MessageFragment;
}

const Message = ({ message }: Props) => {
  return <>{message.body}</>;
};

export default Message;
