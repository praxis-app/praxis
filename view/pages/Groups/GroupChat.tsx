import { Reference } from '@apollo/client';
import { Typography } from '@mui/material';
import { produce } from 'immer';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import ChatPanel from '../../components/Chat/ChatPanel';
import ProgressBar from '../../components/Shared/ProgressBar';
import { useNewMessageSubscription } from '../../graphql/chat/subscriptions/gen/NewMessage.gen';
import { useGroupChatQuery } from '../../graphql/groups/queries/gen/GroupChat.gen';
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

  // TODO: Extract onData handler to a separate function
  useNewMessageSubscription({
    variables: {
      conversationId: chat?.id || 0,
    },
    onData({ data: { data: newMessageData }, client: { cache } }) {
      if (!newMessageData?.newMessage || !chat) {
        return;
      }
      cache.modify({
        id: cache.identify(chat),
        fields: {
          messages(existingRefs, { toReference, readField }) {
            const { newMessage } = newMessageData;
            const alreadyReceived = existingRefs.some(
              (ref: Reference) => readField('id', ref) === newMessage.id,
            );
            if (alreadyReceived) {
              return existingRefs;
            }
            return [...existingRefs, toReference(newMessage)].sort((a, b) => {
              const aCreatedAt = new Date(readField('createdAt', a) as Date);
              const bCreatedAt = new Date(readField('createdAt', b) as Date);
              return aCreatedAt.getTime() - bCreatedAt.getTime();
            });
          },
        },
      });
    },
    skip: !data,
  });

  const { t } = useTranslation();

  const handleLoadMore = async () => {
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
          draft.group.chat.messages.unshift(...group.chat.messages);
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
    <ChatPanel
      conversationId={data.group.chat.id}
      messages={data.group.chat.messages}
      conversationName={data.group.chat.name}
      onLoadMore={handleLoadMore}
      groupName={name || ''}
    />
  );
};

export default GroupChat;
