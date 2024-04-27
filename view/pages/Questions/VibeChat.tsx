import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import MessageFeed from '../../components/Chat/MessageFeed';
import MessageForm from '../../components/Chat/MessageForm';
import ProgressBar from '../../components/Shared/ProgressBar';
import { useVibeChatQuery } from '../../graphql/chat/queries/gen/VibeChat.gen';

const VibeChat = () => {
  const { data, loading, error } = useVibeChatQuery();
  const { t } = useTranslation();

  if (error) {
    return <Typography>{t('errors.somethingWentWrong')}</Typography>;
  }

  if (loading) {
    return <ProgressBar />;
  }

  if (!data) {
    return null;
  }

  return (
    <>
      <MessageFeed messages={data.vibeChat.messages} />
      {data && <MessageForm conversationId={data.vibeChat.id} vibeChat />}
    </>
  );
};

export default VibeChat;
