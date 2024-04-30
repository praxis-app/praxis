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
  onLoadMore(): Promise<void>;
}

const ChatPanel = ({
  conversationId,
  messages,
  vibeChat,
  onLoadMore,
}: Props) => {
  const [feedScrollPosition, setFeedScrollPosition] = useState(0);
  const scrollDirection = useReactiveVar(scrollDirectionVar);
  const feedBottomRef = useRef<HTMLDivElement>(null);

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    setFeedScrollPosition(target.scrollTop);
  };

  const handleImageLoad = () => {
    if (
      feedBottomRef.current &&
      feedScrollPosition > -100 &&
      scrollDirection !== 'up'
    ) {
      feedBottomRef.current.scrollIntoView();
    }
  };

  const handleSubmit = () => {
    if (feedBottomRef.current) {
      feedBottomRef.current.scrollIntoView();
    }
  };

  return (
    <>
      <MessageFeed
        feedBottomRef={feedBottomRef}
        messages={messages}
        onImageLoad={handleImageLoad}
        onLoadMore={onLoadMore}
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
