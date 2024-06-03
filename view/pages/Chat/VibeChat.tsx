import { Typography } from '@mui/material';
import { produce } from 'immer';
import { useTranslation } from 'react-i18next';
import ChatPanel from '../../components/Chat/ChatPanel';
import ProgressBar from '../../components/Shared/ProgressBar';
import { useVibeChatQuery } from '../../graphql/chat/queries/gen/VibeChat.gen';
import { useNewMessageSubscription } from '../../graphql/chat/subscriptions/gen/NewMessage.gen';
import { addNewMessage } from '../../utils/cache.utils';
import { isDeniedAccess } from '../../utils/error.utils';

const VibeChat = () => {
  const { data, loading, error, fetchMore } = useVibeChatQuery();

  useNewMessageSubscription({
    variables: {
      conversationId: data?.vibeChat.id || 0,
    },
    onData({ data: { data: newMessageData }, client: { cache } }) {
      if (!newMessageData?.newMessage || !data?.vibeChat) {
        return;
      }
      addNewMessage(cache, newMessageData.newMessage, data.vibeChat.id);
    },
    skip: !data,
  });

  const { t } = useTranslation();

  const handleLoadMore = async () => {
    if (!data) {
      return;
    }
    await fetchMore({
      variables: {
        offset: data.vibeChat.messages.length,
      },
      updateQuery: (previousResult, { fetchMoreResult }) =>
        produce(previousResult, (draft) => {
          const { vibeChat } = fetchMoreResult;
          draft.vibeChat.messages.unshift(...vibeChat.messages);
        }),
    });
  };

  if (isDeniedAccess(error)) {
    return <Typography>{t('prompts.permissionDenied')}</Typography>;
  }

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
    <ChatPanel chat={data.vibeChat} onLoadMore={handleLoadMore} vibeChat />
  );
};

export default VibeChat;
