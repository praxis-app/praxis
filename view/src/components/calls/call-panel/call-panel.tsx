import { CallChatPanel } from '@/components/calls/call-chat-panel';
import { CallDecisionBanner } from '@/components/calls/call-decision-panel/call-decision-banner';
import { CallDecisionPanel } from '@/components/calls/call-decision-panel/call-decision-panel';
import { CallControls } from '@/components/calls/call-controls';
import { api } from '@/client/api-client';
import { TopNav } from '@/components/nav/top-nav';
import { ResizablePanel } from '@/components/shared/resizable-panel/resizable-panel';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { BrowserEvents, KeyCodes } from '@/constants/shared.constants';
import { PubSubMessageType } from '@/constants/pub-sub.constants';
import { useAuthData } from '@/hooks/use-auth-data';
import { useIsDesktop } from '@/hooks/use-is-desktop';
import { useServerData } from '@/hooks/use-server-data';
import { useSubscription } from '@/hooks/use-subscription';
import { channelPubSubTopic } from '@/lib/pub-sub.utils';
import { cn } from '@/lib/shared.utils';
import { type JoinCallRes } from '@/types/call.types';
import { type ChannelRes } from '@/types/channel.types';
import { type PollRes } from '@/types/poll.types';
import { type PubSubMessage } from '@/types/shared.types';
import {
  GridLayout,
  useParticipants,
  useRoomContext,
  useTracks,
} from '@livekit/components-react';
import { Track } from 'livekit-client';
import { type CSSProperties, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdClose } from 'react-icons/md';
import { CallParticipantTile } from './call-participant-tile';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const getGridColumnCount = (
  trackCount: number,
  isDesktop: boolean,
  isChatOpen: boolean,
) => {
  if (trackCount <= 1) {
    return 1;
  }
  if (trackCount === 2 && (!isDesktop || isChatOpen)) {
    return 1;
  }
  if (trackCount <= 4) {
    return 2;
  }
  if (trackCount <= 9) {
    return 3;
  }
  if (trackCount <= 16) {
    return 4;
  }

  return 5;
};

interface Props {
  channel: ChannelRes;
  callConfig: JoinCallRes;
  serverName?: string;
  onLeave: () => void | Promise<void>;
}

interface NewPollPayload {
  type: PubSubMessageType.POLL;
  poll: PollRes;
}

type SidePanel = 'chat' | 'decisions' | null;

export const CallPanel = ({
  channel,
  callConfig,
  serverName,
  onLeave,
}: Props) => {
  const [sidePanel, setSidePanel] = useState<SidePanel>(null);
  const { serverId } = useServerData();
  const { me } = useAuthData();
  const queryClient = useQueryClient();

  const participants = useParticipants();
  const room = useRoomContext();

  const tracks = useTracks([
    {
      source: Track.Source.Camera,
      withPlaceholder: true,
    },
  ]);

  const isDesktop = useIsDesktop();
  const { t } = useTranslation();

  const handleLeave = useCallback(async () => {
    await room.disconnect();
    await onLeave();
  }, [onLeave, room]);

  const handleEscapeKey = useCallback(() => {
    if (sidePanel) {
      setSidePanel(null);
      return;
    }
    void handleLeave();
  }, [handleLeave, sidePanel]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === KeyCodes.Escape) {
        handleEscapeKey();
      }
    };

    window.addEventListener(BrowserEvents.Keydown, handleKeyDown);
    return () => {
      window.removeEventListener(BrowserEvents.Keydown, handleKeyDown);
    };
  }, [handleEscapeKey]);

  const isChatOpen = sidePanel === 'chat';
  const isDecisionOpen = sidePanel === 'decisions';
  const isSidePanelOpen = !!sidePanel;
  const tileLayoutKey = `${isDesktop ? 'desktop' : 'mobile'}-${sidePanel ? 'panel-open' : 'panel-closed'}-${tracks.length}`;
  const decisionQueryKey = [
    'servers',
    serverId,
    'channels',
    channel.id,
    'calls',
    callConfig.call.id,
    'decisions',
  ];

  const { data: decision } = useQuery({
    queryKey: decisionQueryKey,
    queryFn: async () => {
      if (!serverId) {
        throw new Error('Server ID is required');
      }
      return api.getCallDecision(serverId, channel.id, callConfig.call.id);
    },
    enabled: !!serverId,
  });

  useSubscription(
    channelPubSubTopic('new-poll', serverId, channel.id, me?.id),
    {
      onMessage: (event) => {
        const { body }: PubSubMessage<NewPollPayload> = JSON.parse(event.data);
        if (body?.type === PubSubMessageType.POLL) {
          void queryClient.invalidateQueries({ queryKey: decisionQueryKey });
        }
      },
      enabled: !!me && !!serverId,
    },
  );

  const topNavSubHeader = t(
    serverName
      ? 'calls.descriptions.statusWithServer'
      : 'calls.descriptions.status',
    {
      participants: t('calls.labels.participantCount', {
        count: participants.length,
      }),
      serverName,
    },
  );

  const gridColumnCount = getGridColumnCount(
    tracks.length,
    isDesktop,
    isSidePanelOpen,
  );

  const shouldStackTiles =
    tracks.length === 2 && (!isDesktop || (isDesktop && isSidePanelOpen));

  const gridLayoutStyle: CSSProperties = {
    ...(shouldStackTiles && {
      gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
      gridTemplateRows: 'repeat(2, minmax(0, 1fr))',
    }),
  };

  return (
    <div className="bg-background fixed inset-0 z-50 flex flex-col">
      <TopNav
        header={t('calls.headers.channelCall', { channelName: channel.name })}
        subheader={topNavSubHeader}
        onBackClick={handleLeave}
        backBtnIcon={<MdClose className="size-6" />}
        showSearch={false}
      />

      <main className="min-h-0 flex-1">
        <ResizablePanel
          panel={
            isDesktop && sidePanel ? (
              <aside className="h-full min-w-0">
                {isChatOpen ? (
                  <CallChatPanel
                    serverId={serverId}
                    channel={channel}
                    callId={callConfig.call.id}
                  />
                ) : (
                  <CallDecisionPanel
                    serverId={serverId}
                    channel={channel}
                    callId={callConfig.call.id}
                    onClose={() => setSidePanel(null)}
                  />
                )}
              </aside>
            ) : null
          }
          panelType={isChatOpen ? 'callChat' : 'callDecisions'}
          resizeHandleLabel={t('actions.resizeRightPanel')}
          defaultSize={380}
          minSize="18rem"
          maxSize="70%"
          position="right"
        >
          <div className="flex h-full min-w-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 overflow-hidden p-3">
              <div className="flex h-full min-h-0 w-full flex-col overflow-hidden">
                <GridLayout
                  tracks={tracks}
                  className={cn(
                    'min-h-0 w-full flex-1 grid-rows-[repeat(var(--lk-row-count),minmax(0,1fr))] p-0 [--lk-grid-gap:0.75rem]',
                    shouldStackTiles &&
                      '[&>*:first-child]:items-end [&>*:last-child]:items-start',
                    shouldStackTiles &&
                      !isDesktop &&
                      '[--lk-grid-gap:0.375rem]',
                    gridColumnCount === 2 &&
                      '[&>*:nth-child(even)]:justify-start [&>*:nth-child(odd)]:justify-end',
                    gridColumnCount === 3 &&
                      '[&>*:nth-child(3n)]:justify-start [&>*:nth-child(3n+1)]:justify-end [&>*:nth-child(3n+2)]:justify-center',
                    gridColumnCount === 4 &&
                      '[&>*:nth-child(4n)]:justify-start [&>*:nth-child(4n+1)]:justify-end [&>*:nth-child(4n+2)]:justify-end [&>*:nth-child(4n+3)]:justify-start',
                    gridColumnCount === 5 &&
                      '[&>*:nth-child(5n)]:justify-start [&>*:nth-child(5n+1)]:justify-end [&>*:nth-child(5n+2)]:justify-end [&>*:nth-child(5n+3)]:justify-center [&>*:nth-child(5n+4)]:justify-start',
                  )}
                  style={gridLayoutStyle}
                >
                  <CallParticipantTile layoutKey={tileLayoutKey} />
                </GridLayout>
                {!isDecisionOpen && (
                  <div className="pt-3">
                    <CallDecisionBanner
                      decision={decision?.activeItem}
                      onOpen={() => setSidePanel('decisions')}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-[--color-border] px-3 py-3">
              <div className="flex items-center justify-center">
                <CallControls
                  onLeave={handleLeave}
                  onOpenChat={() =>
                    setSidePanel((panel) => (panel === 'chat' ? null : 'chat'))
                  }
                  onOpenDecisions={() =>
                    setSidePanel((panel) =>
                      panel === 'decisions' ? null : 'decisions',
                    )
                  }
                />
              </div>
            </div>
          </div>
        </ResizablePanel>
      </main>

      {!isDesktop && (
        <Drawer
          open={!!sidePanel}
          onOpenChange={(open) => {
            if (!open) {
              setSidePanel(null);
            }
          }}
        >
          <DrawerContent className="h-[86vh]">
            <DrawerHeader className="sr-only">
              <DrawerTitle>
                {isDecisionOpen
                  ? t('calls.headers.activeDecision')
                  : t('calls.headers.inCallChat')}
              </DrawerTitle>
              <DrawerDescription>
                {isDecisionOpen
                  ? t('calls.decisions.noActiveDescription')
                  : t('calls.descriptions.inCallChat')}
              </DrawerDescription>
            </DrawerHeader>
            {isDecisionOpen ? (
              <CallDecisionPanel
                serverId={serverId}
                channel={channel}
                callId={callConfig.call.id}
                onClose={() => setSidePanel(null)}
              />
            ) : (
              <CallChatPanel
                serverId={serverId}
                channel={channel}
                callId={callConfig.call.id}
              />
            )}
          </DrawerContent>
        </Drawer>
      )}
    </div>
  );
};
