import { Box, Container, SxProps, useTheme } from '@mui/material';
import { DebouncedFunc } from 'lodash';
import { RefObject, UIEvent, useEffect, useRef } from 'react';
import { MessageFragment } from '../../graphql/chat/fragments/gen/Message.gen';
import { useInView } from '../../hooks/shared.hooks';
import Message from './Message';

interface Props {
  feedBottomRef: RefObject<HTMLDivElement>;
  formHeightDiff: number;
  messages: MessageFragment[];
  onImageLoad(): void;
  onLoadMore: DebouncedFunc<() => Promise<void>>;
  onScroll(e: UIEvent<HTMLDivElement>): void;
  scrollPosition: number;
}

const MessageFeed = ({
  feedBottomRef,
  formHeightDiff,
  messages,
  onImageLoad,
  onLoadMore,
  onScroll,
  scrollPosition,
}: Props) => {
  const feedTopRef = useRef<HTMLDivElement>(null);
  const { viewed, setViewed } = useInView(feedTopRef, '50px');
  const theme = useTheme();

  useEffect(() => {
    if (!viewed || scrollPosition > -50) {
      return;
    }
    const handleViewed = async () => {
      await onLoadMore();
      setViewed(false);
    };
    handleViewed();
  }, [viewed, onLoadMore, setViewed, scrollPosition]);

  const feedStyles: SxProps = {
    overflowY: 'scroll',
    position: 'fixed',
    left: 0,
    right: 0,
    zIndex: -1,
    display: 'flex',
    flexDirection: 'column-reverse',
    transition: 'bottom 0.3s ease-in-out',

    [theme.breakpoints.up('xs')]: {
      top: '55px',
      bottom: 153 + formHeightDiff,
    },
    [theme.breakpoints.up('sm')]: {
      top: '63px',
      bottom: 160 + formHeightDiff,
    },
    [theme.breakpoints.up('md')]: {
      top: '60px',
      bottom: 68 + formHeightDiff,
    },
    [theme.breakpoints.up('lg')]: {
      bottom: formHeightDiff,
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
