import { Box, Container, SxProps, useTheme } from '@mui/material';
import { useEffect, useRef } from 'react';
import { MessageFragment } from '../../graphql/chat/fragments/gen/Message.gen';
import Message from './Message';

interface Props {
  messages: MessageFragment[];
}

const MessageFeed = ({ messages }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const theme = useTheme();

  useEffect(() => {
    if (ref.current) {
      ref.current.scrollIntoView();
    }
  }, [messages]);

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
    <Box sx={feedStyles}>
      <Box ref={ref} />
      <Container maxWidth="sm" sx={containerStyles}>
        <Box>
          {messages.map((message) => (
            <Message key={message.id} message={message} />
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default MessageFeed;
