import { MessageFragment } from '../../graphql/chat/fragments/gen/Message.gen';
import Message from './Message';

interface Props {
  messages: MessageFragment[];
}

const MessageFeed = ({ messages }: Props) => {
  return (
    <>
      {messages.map((message) => (
        <Message key={message.id} message={message} />
      ))}
    </>
  );
};

export default MessageFeed;
