import { Reference } from '@apollo/client';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import MessageFeed from '../../components/Chat/MessageFeed';
import MessageForm from '../../components/Chat/MessageForm';
import ProgressBar from '../../components/Shared/ProgressBar';
import { useVibeChatQuery } from '../../graphql/chat/queries/gen/VibeChat.gen';
import { useNewMessageSubscription } from '../../graphql/chat/subscriptions/gen/NewMessage.gen';

const VibeChat = () => {
  const { data, loading, error } = useVibeChatQuery();

  useNewMessageSubscription({
    variables: {
      conversationId: data?.vibeChat.id || 0,
    },
    onData({ data: { data: newMessageData }, client: { cache } }) {
      if (!newMessageData?.newMessage || !data?.vibeChat) {
        return;
      }
      cache.modify({
        id: cache.identify(data.vibeChat),
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
