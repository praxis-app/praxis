import { Box, Container, SxProps, useTheme } from '@mui/material';
import { RefObject, UIEvent } from 'react';
import { MessageFragment } from '../../graphql/chat/fragments/gen/Message.gen';
import Message from './Message';

interface Props {
  messages: MessageFragment[];

  // TODO: Check if special hook is needed for this
  feedRef: RefObject<HTMLDivElement>;

  onScroll(e: UIEvent<HTMLDivElement>): void;
  onImageLoad(): void;
}

const MessageFeed = ({ messages, feedRef, onScroll, onImageLoad }: Props) => {
  const theme = useTheme();

  const feedStyles: SxProps = {
    overflowY: 'scroll',
    position: 'fixed',
    left: 0,
    right: 0,
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
      <Box ref={feedRef} />
      <Container maxWidth="sm" sx={containerStyles}>
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
