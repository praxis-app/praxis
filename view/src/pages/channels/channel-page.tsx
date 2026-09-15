import { api } from '@/client/api-client';
import { TextChannelView } from '@/components/channels/text-channel-view';
import { ForumChannelView } from '@/components/forum/forum-channel-view';
import {
  LocalStorageKeys,
  NavigationPaths,
} from '@/constants/shared.constants';
import { useAuthData } from '@/hooks/use-auth-data';
import { useServerData } from '@/hooks/use-server-data';
import { useUnreadChannels } from '@/hooks/use-unread-channels';
import { withoutSearchPanel } from '@/lib/search.utils';
import {
  type RightPanel,
  type StandaloneRightPanel,
} from '@/types/right-panel.types';
import { type ThreadIdentity } from '@/types/message.types';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import {
  Navigate,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';

const LARGE_DESKTOP_MEDIA_QUERY = '(min-width: 1200px)';

const getDefaultStandaloneRightPanel = (): StandaloneRightPanel | null => {
  const storedPreference = localStorage.getItem(
    LocalStorageKeys.DecisionsPanelOpen,
  );
  const isOpen =
    storedPreference === 'true' ||
    (storedPreference !== 'false' &&
      window.matchMedia(LARGE_DESKTOP_MEDIA_QUERY).matches);

  return isOpen ? { type: 'activeDecisions' } : null;
};

export const ChannelPage = () => {
  const [standaloneRightPanel, setStandaloneRightPanel] =
    useState<StandaloneRightPanel | null>(getDefaultStandaloneRightPanel);

  const { isRegistered } = useAuthData();
  const { serverId } = useServerData();
  const { unreadChannelIds, markChannelRead } = useUnreadChannels();

  const { channelId, postId, serverSlug } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const threadRootId = searchParams.get('thread');
  const threadRootKind =
    searchParams.get('threadKind') === 'poll' ? 'poll' : 'message';

  const rightPanel: RightPanel = postId
    ? { type: 'forumPost', postId }
    : threadRootId
      ? {
          type: 'thread',
          rootKind: threadRootKind,
          rootId: threadRootId,
        }
      : standaloneRightPanel;

  const channelPath =
    serverSlug && channelId ? `/s/${serverSlug}/c/${channelId}` : undefined;

  useEffect(() => {
    setStandaloneRightPanel(getDefaultStandaloneRightPanel());
  }, [serverId]);

  useEffect(() => {
    if (channelId && unreadChannelIds.includes(channelId)) {
      markChannelRead(channelId);
    }
  }, [channelId, markChannelRead, unreadChannelIds]);

  useEffect(() => {
    if (postId) {
      setStandaloneRightPanel(null);
    } else {
      setStandaloneRightPanel(getDefaultStandaloneRightPanel());
    }
  }, [postId]);

  const closeDecisionsPanel = () => {
    localStorage.setItem(LocalStorageKeys.DecisionsPanelOpen, 'false');
    setStandaloneRightPanel(null);
  };

  const openRightPanel = (panel: StandaloneRightPanel) => {
    if (postId && channelPath) {
      void navigate(channelPath);
    }
    if (threadRootId) {
      const nextSearchParams = withoutSearchPanel(searchParams);
      nextSearchParams.delete('thread');
      nextSearchParams.delete('threadKind');
      setSearchParams(nextSearchParams, { replace: true });
    }
    localStorage.setItem(LocalStorageKeys.DecisionsPanelOpen, 'true');
    setStandaloneRightPanel(panel);
  };

  const openThread = (thread: ThreadIdentity) => {
    const nextSearchParams = withoutSearchPanel(searchParams);
    nextSearchParams.set('thread', thread.rootId);
    if (thread.rootKind === 'poll') {
      nextSearchParams.set('threadKind', 'poll');
    } else {
      nextSearchParams.delete('threadKind');
    }
    setSearchParams(nextSearchParams);
  };

  const closeThread = () => {
    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.delete('thread');
    nextSearchParams.delete('threadKind');
    setSearchParams(nextSearchParams, { replace: true });
  };

  const toggleDecisionsPanel = () => {
    if (rightPanel?.type === 'activeDecisions') {
      closeDecisionsPanel();
      return;
    }
    openRightPanel({ type: 'activeDecisions' });
  };

  const { data: channelData, error: channelError } = useQuery({
    queryKey: ['servers', serverId, 'channels', channelId],
    queryFn: async () => {
      try {
        if (!serverId || !channelId) {
          throw new Error('Missing server or channel id');
        }
        const result = await api.getChannel(serverId, channelId);
        return result;
      } catch (error) {
        await navigate(
          isRegistered ? NavigationPaths.Root : NavigationPaths.Explore,
        );
        console.error(error);
        return null;
      }
    },
    enabled: !!channelId && !!serverId,
  });

  const channel = channelData?.channel;
  const channelServerSlug = channel?.server?.slug;

  if (channelServerSlug && serverSlug !== channelServerSlug) {
    return <Navigate to={`/s/${channelServerSlug}/c/${channel.id}`} replace />;
  }

  if (channelError) {
    throw new Error(channelError.message);
  }

  if (channel?.channelType === 'forum') {
    return (
      <ForumChannelView
        channel={channel}
        rightPanel={rightPanel}
        onCloseDecisionsPanel={closeDecisionsPanel}
        onToggleDecisionsPanel={toggleDecisionsPanel}
      />
    );
  }

  return (
    <TextChannelView
      channel={channel}
      rightPanel={rightPanel}
      onCloseDecisionsPanel={closeDecisionsPanel}
      onToggleDecisionsPanel={toggleDecisionsPanel}
      onOpenThread={openThread}
      onCloseThread={closeThread}
    />
  );
};
