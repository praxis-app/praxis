import { Box, Container, SxProps, useTheme } from '@mui/material';
import { MessageFragment } from '../../graphql/chat/fragments/gen/Message.gen';
import { useIsDesktop } from '../../hooks/shared.hooks';
import Message from './Message';

interface Props {
  messages: MessageFragment[];
}

const MessageFeed = ({ messages }: Props) => {
  const isDesktop = useIsDesktop();
  const theme = useTheme();

  const containerStyles: SxProps = {
    [theme.breakpoints.up('xs')]: {
      paddingX: 0,
      paddingTop: '30px',
      paddingBottom: '12px',
      top: '55px',
      bottom: '155px',
    },
    [theme.breakpoints.up('sm')]: {
      paddingBottom: '6px',
      bottom: '162px',
      top: '63px',
    },
    [theme.breakpoints.up('md')]: {
      paddingTop: '45px',
      paddingBottom: '8px',
      top: '60px',
      bottom: '170px',
    },
    [theme.breakpoints.up('lg')]: {
      paddingBottom: '6px',
      bottom: '105px',
    },
    position: 'fixed',
    top: isDesktop ? '60px' : '55px',
    bottom: isDesktop ? '110px' : '155px',
    display: 'flex',
    flexDirection: 'column-reverse',
    overflowY: 'scroll',
  };

  return (
    <Container maxWidth="sm" sx={containerStyles}>
      <Box>
        {messages.map((message) => (
          <Message key={message.id} message={message} />
        ))}
      </Box>
    </Container>
  );
};

export default MessageFeed;
