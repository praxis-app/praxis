import { api } from '@/client/api-client';
import { ChannelListItemDesktop } from '@/components/channels/channel-list-item-desktop';
import { ChannelListSkeleton } from '@/components/channels/channel-list-skeleton';
import { useAuthData } from '@/hooks/use-auth-data';
import { useAbility } from '@/hooks/use-ability';
import { useServerData } from '@/hooks/use-server-data';
import { handleError } from '@/lib/error.utils';
import { useAppStore } from '@/store/app.store';
import { useAuthStore } from '@/store/auth.store';
import { type ChannelRes } from '@/types/channel.types';
import {
  DragDropContext,
  Draggable,
  Droppable,
  type DropResult,
} from '@hello-pangea/dnd';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useParams } from 'react-router-dom';

/**
 * Channel list component for the left navigation panel on desktop
 */
export const ChannelListDesktop = () => {
  const [optimisticChannels, setOptimisticChannels] = useState<
    ChannelRes[] | null
  >(null);

  const { inviteToken } = useAuthStore();
  const { isAppLoading } = useAppStore();
  const queryClient = useQueryClient();

  const { isMeSuccess, isAuthError } = useAuthData();
  const { serverId, serverSlug } = useServerData();
  const { serverAbility } = useAbility();

  const { channelId } = useParams();
  const canManageChannels = serverAbility.can('manage', 'Channel');
  const joinedChannelsQueryKey = [
    'servers',
    serverId,
    'channels',
    'joined',
  ] as const;

  const { data: joinedChannelsData, isLoading: isJoinedChannelsLoading } =
    useQuery({
      queryKey: joinedChannelsQueryKey,
      queryFn: async () => {
        if (!serverId) {
          throw new Error('Current server not found');
        }
        return api.getJoinedChannels(serverId);
      },
      enabled: !!serverId && isMeSuccess,
    });

  const { data: publicChannelsData, isLoading: isPublicChannelsLoading } =
    useQuery({
      queryKey: ['servers', serverId, 'channels', inviteToken],
      queryFn: async () => {
        if (!serverId) {
          throw new Error('Current server not found');
        }
        return api.getChannels(serverId);
      },
      enabled: !!serverId && isAuthError,
    });

  const isLoading =
    isJoinedChannelsLoading || isPublicChannelsLoading || isAppLoading;
  const queriedChannels =
    joinedChannelsData?.channels || publicChannelsData?.channels || [];
  const channels = optimisticChannels ?? queriedChannels;

  const { mutate: updateChannelOrder, isPending: isUpdatingOrder } =
    useMutation({
      mutationFn: async (reorderedChannels: ChannelRes[]) => {
        if (!serverId) {
          throw new Error('Current server not found');
        }
        await api.updateChannelOrder(serverId, {
          channelIds: reorderedChannels.map((channel) => channel.id),
        });
      },
      onSuccess: (_data, reorderedChannels) => {
        queryClient.setQueryData<{ channels: ChannelRes[] }>(
          joinedChannelsQueryKey,
          { channels: reorderedChannels },
        );
        setOptimisticChannels(null);
      },
      onError: (error: Error) => {
        setOptimisticChannels(null);
        handleError(error);
      },
      onSettled: () => {
        void queryClient.invalidateQueries({
          queryKey: joinedChannelsQueryKey,
        });
      },
    });

  if (!serverSlug || isLoading) {
    return <ChannelListSkeleton />;
  }

  const handleDragEnd = ({ source, destination }: DropResult) => {
    if (
      !destination ||
      destination.index === source.index ||
      !canManageChannels ||
      isUpdatingOrder
    ) {
      return;
    }

    const reorderedChannels = [...channels];
    const [movedChannel] = reorderedChannels.splice(source.index, 1);
    reorderedChannels.splice(destination.index, 0, movedChannel);
    void queryClient.cancelQueries({ queryKey: joinedChannelsQueryKey });
    setOptimisticChannels(reorderedChannels);
    updateChannelOrder(reorderedChannels);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable
        droppableId="desktop-channel-list"
        isDropDisabled={!canManageChannels || isUpdatingOrder}
      >
        {(droppableProvided) => (
          <div
            ref={droppableProvided.innerRef}
            {...droppableProvided.droppableProps}
            className="flex flex-1 flex-col gap-0.5 overflow-y-scroll py-2 select-none"
            data-testid="channel-list"
          >
            {channels.map((channel, index) => (
              <Draggable
                key={channel.id}
                draggableId={channel.id}
                index={index}
                isDragDisabled={!canManageChannels || isUpdatingOrder}
                disableInteractiveElementBlocking
              >
                {(draggableProvided, draggableSnapshot) => (
                  <div
                    ref={draggableProvided.innerRef}
                    {...draggableProvided.draggableProps}
                    {...draggableProvided.dragHandleProps}
                    className={
                      canManageChannels
                        ? 'cursor-grab active:cursor-grabbing'
                        : undefined
                    }
                    data-testid="channel-list-item"
                    data-dragging={draggableSnapshot.isDragging || undefined}
                  >
                    <ChannelListItemDesktop
                      channel={channel}
                      isActive={channelId === channel.id}
                      serverSlug={serverSlug}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {droppableProvided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};
