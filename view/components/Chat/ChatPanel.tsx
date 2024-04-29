import { useReactiveVar } from '@apollo/client';
import { UIEvent, useRef, useState } from 'react';
import MessageFeed from '../../components/Chat/MessageFeed';
import MessageForm from '../../components/Chat/MessageForm';
import { scrollDirectionVar } from '../../graphql/cache';
import { MessageFragment } from '../../graphql/chat/fragments/gen/Message.gen';

interface Props {
  conversationId: number;
  messages: MessageFragment[];
  vibeChat?: boolean;
}

const ChatPanel = ({ conversationId, messages, vibeChat }: Props) => {
  const [feedScrollPosition, setFeedScrollPosition] = useState(0);
  const scrollPosition = useReactiveVar(scrollDirectionVar);
  const feedRef = useRef<HTMLDivElement>(null);

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    setFeedScrollPosition(target.scrollTop);
  };

  const handleImageLoad = () => {
    if (
      feedRef.current &&
      feedScrollPosition > -100 &&
      scrollPosition !== 'up'
    ) {
      feedRef.current.scrollIntoView();
    }
  };

  const handleSubmit = () => {
    if (feedRef.current) {
      feedRef.current.scrollIntoView();
    }
  };

  return (
    <>
      <MessageFeed
        feedRef={feedRef}
        messages={messages}
        onImageLoad={handleImageLoad}
        onScroll={handleScroll}
      />
      <MessageForm
        conversationId={conversationId}
        onSubmit={handleSubmit}
        vibeChat={vibeChat}
      />
    </>
  );
};

export default ChatPanel;
