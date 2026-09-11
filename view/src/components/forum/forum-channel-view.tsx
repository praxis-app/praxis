import { SearchPanelLayout } from '@/components/search/search-panel-layout';
import { ChannelTopNav } from '@/components/channels/channel-top-nav';
import { DecisionsPanel } from '@/components/decisions/decisions-panel';
import { ForumPostDetail } from '@/components/forum/forum-post-detail';
import { ForumPostList } from '@/components/forum/forum-post-list';
import { LeftNavDesktop } from '@/components/nav/left-nav-desktop';
import { ResizablePanel } from '@/components/shared/resizable-panel/resizable-panel';
import { BrowserEvents, KeyCodes } from '@/constants/shared.constants';
import { useAuthData } from '@/hooks/use-auth-data';
import { useChannelCall } from '@/hooks/use-channel-call';
import { useInstanceCapabilitiesQuery } from '@/hooks/use-instance-capabilities-query';
import { useIsDesktop } from '@/hooks/use-is-desktop';
import { useServerData } from '@/hooks/use-server-data';
import { useSubscription } from '@/hooks/use-subscription';
import { channelPubSubTopic } from '@/lib/pub-sub.utils';
import { type ChannelRes } from '@/types/channel.types';
import { type RightPanel } from '@/types/right-panel.types';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

interface Props {
  channel: ChannelRes;
  rightPanel: RightPanel;
  onCloseDecisionsPanel: () => void;
  onToggleDecisionsPanel: () => void;
}

export const ForumChannelView = ({
  channel,
  rightPanel,
  onCloseDecisionsPanel,
  onToggleDecisionsPanel,
}: Props) => {
  const { me } = useAuthData();
  const { server, serverId, serverPath } = useServerData();
  const { data: capabilities } = useInstanceCapabilitiesQuery();

  const {
    callConfig,
    callPreferences,
    cancelPreJoin,
    confirmJoinCall,
    isJoining,
    isPreJoinOpen,
    joinCall,
    leaveCall,
  } = useChannelCall(serverId, channel.id);

  const queryClient = useQueryClient();
  const isDesktop = useIsDesktop();
  const { t } = useTranslation();
  const { postId } = useParams();
  const navigate = useNavigate();

  const isDecisionsPanelOpen = rightPanel?.type === 'activeDecisions';
  const isForumPostPanelOpen =
    rightPanel?.type === 'forumPost' && rightPanel.postId === postId;

  useEffect(() => {
    if (!isDesktop || !postId) return;

    const closePostOnEscape = (event: KeyboardEvent) => {
      if (event.key === KeyCodes.Escape && !event.defaultPrevented) {
        navigate(`${serverPath}/c/${channel.id}`);
      }
    };

    window.addEventListener(BrowserEvents.Keydown, closePostOnEscape);
    return () => {
      window.removeEventListener(BrowserEvents.Keydown, closePostOnEscape);
    };
  }, [channel.id, isDesktop, navigate, postId, serverPath]);

  useSubscription(
    channelPubSubTopic('new-forum-post', serverId, channel.id, me?.id),
    {
      onMessage: () => {
        void queryClient.invalidateQueries({
          queryKey: ['servers', serverId, 'channels', channel.id, 'forum'],
        });
      },
      enabled: !!serverId && !!me,
    },
  );

  useSubscription(
    channelPubSubTopic('new-poll', serverId, channel.id, me?.id),
    {
      onMessage: () => {
        void queryClient.invalidateQueries({
          queryKey: ['servers', serverId, 'channels', channel.id, 'forum'],
        });
      },
      enabled: !!serverId && !!me,
    },
  );

  useSubscription(
    channelPubSubTopic('new-message', serverId, channel.id, me?.id),
    {
      onMessage: () => {
        void queryClient.invalidateQueries({
          queryKey: ['servers', serverId, 'channels', channel.id, 'forum'],
        });
      },
      enabled: !!serverId && !!me,
    },
  );

  const desktopRightPanel =
    isDesktop && postId && isForumPostPanelOpen ? (
      <ForumPostDetail channel={channel} postId={postId} isPane />
    ) : isDesktop && isDecisionsPanelOpen ? (
      <DecisionsPanel isOpen onClose={onCloseDecisionsPanel} />
    ) : null;

  return (
    <div className="fixed inset-0 flex">
      <ResizablePanel
        panel={isDesktop ? <LeftNavDesktop me={me} /> : null}
        panelType="channelsList"
        resizeHandleLabel={t('actions.resizeChannelsPanel')}
        defaultSize={240}
        minSize="12rem"
        maxSize={400}
        position="left"
        groupResizeBehavior="preserve-pixel-size"
      >
        <SearchPanelLayout
          panel={desktopRightPanel}
          panelType={isForumPostPanelOpen ? 'forumPost' : 'activeDecisions'}
          resizeHandleLabel={t('actions.resizeRightPanel')}
          defaultSize={isForumPostPanelOpen ? 720 : 320}
          minSize="18rem"
          maxSize="70%"
          position="right"
        >
          <div className="flex h-full min-w-0 flex-1 flex-col">
            <ChannelTopNav
              channel={channel}
              callConfig={callConfig}
              callPreferences={callPreferences}
              isDecisionsPanelOpen={isDecisionsPanelOpen}
              isJoiningCall={isJoining}
              isPreJoinOpen={isPreJoinOpen}
              onCancelPreJoin={cancelPreJoin}
              onConfirmJoinCall={confirmJoinCall}
              onJoinCall={joinCall}
              onLeaveCall={leaveCall}
              videoCallsEnabled={capabilities?.videoCallsEnabled === true}
              onToggleDecisionsPanel={onToggleDecisionsPanel}
              serverName={server?.name}
            />

            {isDesktop || !postId ? (
              <ForumPostList channel={channel} selectedPostId={postId} />
            ) : (
              <ForumPostDetail channel={channel} postId={postId} />
            )}
          </div>
        </SearchPanelLayout>
      </ResizablePanel>
    </div>
  );
};
