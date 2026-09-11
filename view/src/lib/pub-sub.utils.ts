type PubSubTopicKind =
  | 'new-message'
  | 'new-poll'
  | 'new-call'
  | 'new-forum-post';

const PUB_SUB_TOPIC_DELIMITER = ':';

export const channelPubSubTopic = (
  kind: PubSubTopicKind,
  serverId: string | undefined,
  channelId: string | undefined,
  userId: string | undefined,
) => {
  return [kind, serverId, channelId, userId].join(PUB_SUB_TOPIC_DELIMITER);
};

export const callPubSubTopic = (
  kind: PubSubTopicKind,
  serverId: string | undefined,
  channelId: string | undefined,
  callId: string | undefined,
  userId: string | undefined,
) => {
  return [kind, serverId, channelId, callId, userId].join(
    PUB_SUB_TOPIC_DELIMITER,
  );
};

export const notificationPubSubTopic = (
  serverId: string | undefined,
  userId: string | undefined,
) => ['notification', serverId, userId].join(PUB_SUB_TOPIC_DELIMITER);
