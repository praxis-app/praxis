import { Box, Container, SxProps, useTheme } from '@mui/material';
import { RefObject, UIEvent, useEffect, useRef } from 'react';
import { MessageFragment } from '../../graphql/chat/fragments/gen/Message.gen';
import { useInView } from '../../hooks/shared.hooks';
import Message from './Message';

interface Props {
  feedBottomRef: RefObject<HTMLDivElement>;
  messages: MessageFragment[];
  onImageLoad(): void;
  onLoadMore(): Promise<void>;
  onScroll(e: UIEvent<HTMLDivElement>): void;
}

const MessageFeed = ({
  feedBottomRef,
  messages,
  onImageLoad,
  onLoadMore,
  onScroll,
}: Props) => {
  const feedTopRef = useRef<HTMLDivElement>(null);
  const { viewed, setViewed } = useInView(feedTopRef, '50px');
  const theme = useTheme();

  useEffect(() => {
    if (!viewed) {
      return;
    }
    const handleViewed = async () => {
      await onLoadMore();
      setViewed(false);
    };
    handleViewed();
  }, [viewed, onLoadMore, setViewed]);

  const feedStyles: SxProps = {
    overflowY: 'scroll',
    position: 'fixed',
    left: 0,
    right: 0,
    zIndex: -1,
    display: 'flex',
    flexDirection: 'column-reverse',
    [theme.breakpoints.up('xs')]: {
      top: '55px',
      bottom: '162px',
    },
    [theme.breakpoints.up('sm')]: {
      bottom: '162px',
      top: '63px',
    },
    [theme.breakpoints.up('md')]: {
      top: '60px',
      bottom: '68px',
    },
    [theme.breakpoints.up('lg')]: {
      bottom: 0,
    },
  };

  const containerStyles: SxProps = {
    [theme.breakpoints.up('xs')]: {
      paddingTop: '30px',
      paddingBottom: '12px',
    },
    [theme.breakpoints.up('sm')]: {
      paddingBottom: '6px',
      paddingX: '35px',
    },
    [theme.breakpoints.up('md')]: {
      paddingTop: '45px',
      paddingBottom: '110px',
    },
    [theme.breakpoints.up('lg')]: {
      paddingBottom: '112px',
    },
  };

  return (
    <Box onScroll={onScroll} sx={feedStyles}>
      <Box ref={feedBottomRef} />
      <Container maxWidth="sm" sx={containerStyles}>
        <Box ref={feedTopRef} />
        <Box>
          {messages.map((message) => (
            <Message
              key={message.id}
              message={message}
              onImageLoad={onImageLoad}
            />
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default MessageFeed;
