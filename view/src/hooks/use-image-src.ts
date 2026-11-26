import { api } from '@/client/api-client';
import { useInView } from '@/hooks/use-in-view';
import { useServerData } from '@/hooks/use-server-data';
import { useAuthStore } from '@/store/auth.store';
import { useQuery } from '@tanstack/react-query';
import { type RefObject } from 'react';

interface UseImageSrcProps {
  enabled?: boolean;
  imageId?: string;
  channelId?: string;
  messageId?: string;
  pollId?: string;
  eventId?: string;
  eventCoverPhoto?: boolean;
  userId?: string;
  serverImageServerId?: string;
  ref: RefObject<HTMLElement | null>;
}

export const useImageSrc = ({
  enabled = true,
  imageId,
  channelId,
  messageId,
  pollId,
  eventId,
  eventCoverPhoto = false,
  userId,
  serverImageServerId,
  ref,
}: UseImageSrcProps) => {
  const { inviteToken } = useAuthStore();
  const { serverId } = useServerData();

  const { viewed } = useInView(ref, '100px');

  const getImageSrc = async () => {
    if (!imageId) {
      return '';
    }
    let result: Blob;

    // Determine which API method to call based on parent context
    if (serverImageServerId) {
      result = await api.getServerImage(serverImageServerId, imageId);
    } else if (messageId && channelId) {
      if (!serverId) {
        throw new Error('Server ID is required for message images');
      }
      result = await api.getMessageImage(
        serverId,
        channelId,
        messageId,
        imageId,
      );
    } else if (eventCoverPhoto && pollId && channelId) {
      if (!serverId) {
        throw new Error('Server ID is required for event cover photos');
      }
      result = await api.getPollActionEventCoverPhoto(
        serverId,
        channelId,
        pollId,
        imageId,
      );
    } else if (pollId && channelId) {
      if (!serverId) {
        throw new Error('Server ID is required for poll images');
      }
      result = await api.getPollImage(serverId, channelId, pollId, imageId);
    } else if (eventId) {
      if (!serverId) {
        throw new Error('Server ID is required for event cover photos');
      }
      result = await api.getEventCoverPhoto(serverId, eventId, imageId);
    } else if (userId) {
      result = await api.getUserImage(userId, imageId);
    } else {
      throw new Error('Invalid image context: missing parent identifiers');
    }

    return URL.createObjectURL(result);
  };

  const { data, isError } = useQuery({
    queryKey: [
      'images',
      serverId,
      channelId,
      imageId,
      messageId,
      pollId,
      eventId,
      eventCoverPhoto,
      userId,
      serverImageServerId,
      inviteToken,
    ],
    queryFn: getImageSrc,
    enabled: !!imageId && viewed && enabled,
    staleTime: Infinity,
  });

  return { src: data, isError: isError && !data };
};
