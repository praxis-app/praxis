import { Typography } from '@mui/material';
import { produce } from 'immer';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { debounce } from 'lodash';
import ChatPanel from '../../components/Chat/ChatPanel';
import ProgressBar from '../../components/Shared/ProgressBar';
import { useNewMessageSubscription } from '../../graphql/chat/subscriptions/gen/NewMessage.gen';
import { useGroupChatQuery } from '../../graphql/groups/queries/gen/GroupChat.gen';
import { addNewMessage } from '../../utils/cache.utils';
import { isDeniedAccess } from '../../utils/error.utils';

const GroupChat = () => {
  const { name } = useParams();
  const { data, error, loading, fetchMore } = useGroupChatQuery({
    variables: {
      name: name || '',
    },
    skip: !name,
  });
  const chat = data?.group.chat;

  useNewMessageSubscription({
    variables: {
      conversationId: chat?.id || 0,
    },
    onData({ data: { data: newMessageData }, client: { cache } }) {
      if (!newMessageData?.newMessage || !chat) {
        return;
      }
      addNewMessage(cache, newMessageData.newMessage, chat.id);
    },
    skip: !data,
  });

  const { t } = useTranslation();

  const handleLoadMore = debounce(async () => {
    if (!chat) {
      return;
    }
    await fetchMore({
      variables: {
        offset: chat.messages.length,
      },
      updateQuery: (previousResult, { fetchMoreResult }) =>
        produce(previousResult, (draft) => {
          const { group } = fetchMoreResult;
          const filteredMessages = group.chat.messages.filter(
            (message) =>
              !draft.group.chat.messages.some(
                (existingMessage) => existingMessage.id === message.id,
              ),
          );
          draft.group.chat.messages.unshift(...filteredMessages);
        }),
    });
  }, 250);

  if (isDeniedAccess(error)) {
    return <Typography>{t('prompts.permissionDenied')}</Typography>;
  }

  if (error) {
    return <Typography>{t('errors.somethingWentWrong')}</Typography>;
  }

  if (loading) {
    return <ProgressBar />;
  }

  if (!chat) {
    return null;
  }

  return (
    <ChatPanel chat={chat} onLoadMore={handleLoadMore} groupName={name || ''} />
  );
};

export default GroupChat;
