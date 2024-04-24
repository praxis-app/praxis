import { Box, Typography } from '@mui/material';
import { useVibeChatQuery } from '../../graphql/chat/queries/gen/VibeChat.gen';
import ProgressBar from '../../components/Shared/ProgressBar';
import { useTranslation } from 'react-i18next';
import MessageForm from '../../components/Chat/MessageForm';

const VibeChat = () => {
  const { data, loading, error } = useVibeChatQuery();
  const { t } = useTranslation();

  if (error) {
    return <Typography>{t('errors.somethingWentWrong')}</Typography>;
  }

  if (loading) {
    return <ProgressBar />;
  }

  return (
    <>
      <Box paddingBottom={8}>{JSON.stringify(data)}</Box>

      {data && <MessageForm conversationId={data.vibeChat.id} />}
    </>
  );
};

export default VibeChat;
