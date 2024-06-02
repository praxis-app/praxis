import { useReactiveVar } from '@apollo/client';
import { UIEvent, useEffect, useRef, useState } from 'react';
import MessageFeed from '../../components/Chat/MessageFeed';
import MessageForm from '../../components/Chat/MessageForm';
import { activeChatVar, scrollDirectionVar } from '../../graphql/cache';
import { MessageFragment } from '../../graphql/chat/fragments/gen/Message.gen';
import { useIsDesktop } from '../../hooks/shared.hooks';

const CHAT_FORM_HEIGHT = 99;
const CHAT_FORM_HEIGHT_DESKTOP = 92;

interface Props {
  conversationId: number;
  conversationName: string;
  groupName?: string;
  messages: MessageFragment[];
  onLoadMore(): Promise<void>;
  vibeChat?: boolean;
}

const ChatPanel = ({
  conversationId,
  conversationName,
  groupName,
  messages,
  onLoadMore,
  vibeChat,
}: Props) => {
  const isDesktop = useIsDesktop();
  const initialFormHeight = isDesktop
    ? CHAT_FORM_HEIGHT_DESKTOP
    : CHAT_FORM_HEIGHT;

  const [formHeight, setFormHeight] = useState(initialFormHeight);
  const [feedScrollPosition, setFeedScrollPosition] = useState(0);
  const scrollDirection = useReactiveVar(scrollDirectionVar);

  const feedBottomRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

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
        formHeightDiff={formHeight - initialFormHeight}
        messages={messages}
        onImageLoad={handleImageLoad}
        onLoadMore={onLoadMore}
        onScroll={handleScroll}
      />
      <MessageForm
        conversationId={conversationId}
        formRef={formRef}
        groupName={groupName}
        onSubmit={handleSubmit}
        setFormHeight={setFormHeight}
        vibeChat={vibeChat}
      />
    </>
  );
};

export default ChatPanel;
