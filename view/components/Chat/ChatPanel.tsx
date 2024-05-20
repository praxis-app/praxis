import { useReactiveVar } from '@apollo/client';
import { UIEvent, useEffect, useRef, useState } from 'react';
import MessageFeed from '../../components/Chat/MessageFeed';
import MessageForm from '../../components/Chat/MessageForm';
import { activeChatVar, scrollDirectionVar } from '../../graphql/cache';
import { MessageFragment } from '../../graphql/chat/fragments/gen/Message.gen';

interface Props {
  conversationId: number;
  conversationName: string;
  messages: MessageFragment[];
  onLoadMore(): Promise<void>;
  vibeChat?: boolean;
}

const ChatPanel = ({
  conversationId,
  conversationName,
  messages,
  onLoadMore,
  vibeChat,
}: Props) => {
  const [feedScrollPosition, setFeedScrollPosition] = useState(0);
  const scrollDirection = useReactiveVar(scrollDirectionVar);
  const feedBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (conversationId && conversationName) {
      activeChatVar({
        id: conversationId,
        name: conversationName,
      });
    }
    return () => {
      activeChatVar(null);
    };
  }, [conversationId, conversationName]);

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
