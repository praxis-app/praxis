import { useApolloClient, useReactiveVar } from '@apollo/client';
import { DebouncedFunc } from 'lodash';
import { UIEvent, useEffect, useRef, useState } from 'react';
import MessageFeed from '../../components/Chat/MessageFeed';
import MessageForm from '../../components/Chat/MessageForm';
import { activeChatVar, scrollDirectionVar } from '../../graphql/cache';
import { ChatPanelFragment } from '../../graphql/chat/fragments/gen/ChatPanel.gen';
import { useIsDesktop } from '../../hooks/shared.hooks';

const CHAT_FORM_HEIGHT = 99;
const CHAT_FORM_HEIGHT_DESKTOP = 92;

interface Props {
  chat: ChatPanelFragment;
  groupName?: string;
  onLoadMore: DebouncedFunc<() => Promise<void>>;
  vibeChat?: boolean;
}

const ChatPanel = ({ groupName, chat, onLoadMore, vibeChat }: Props) => {
  const isDesktop = useIsDesktop();
  const initialFormHeight = isDesktop
    ? CHAT_FORM_HEIGHT_DESKTOP
    : CHAT_FORM_HEIGHT;

  const [formHeight, setFormHeight] = useState(initialFormHeight);
  const [feedScrollPosition, setFeedScrollPosition] = useState(0);
  const scrollDirection = useReactiveVar(scrollDirectionVar);

  const { cache } = useApolloClient();
  const feedBottomRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    activeChatVar({
      id: chat.id,
      name: chat.name,
    });
    cache.modify({
      id: cache.identify(chat),
      fields: { unreadMessageCount: () => 0 },
    });
    return () => {
      activeChatVar(null);
    };
  }, [chat, cache]);

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
        scrollPosition={feedScrollPosition}
        messages={chat.messages}
        onImageLoad={handleImageLoad}
        onLoadMore={onLoadMore}
        onScroll={handleScroll}
      />
      <MessageForm
        conversationId={chat.id}
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
