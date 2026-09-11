import { SearchPanelLayout } from '@/components/search/search-panel-layout';
import { DecisionsPanel } from '@/components/decisions/decisions-panel';
import { EventRsvpControls } from '@/components/events/event-rsvp-controls';
import { EventSummary } from '@/components/events/event-summary';
import { LeftNavDesktop } from '@/components/nav/left-nav-desktop';
import { ResizablePanel } from '@/components/shared/resizable-panel/resizable-panel';
import { TopNav } from '@/components/nav/top-nav';
import { Skeleton } from '@/components/ui/skeleton';
import { LocalStorageKeys } from '@/constants/shared.constants';
import { useAuthData } from '@/hooks/use-auth-data';
import { useEventQuery } from '@/hooks/events/use-event-query';
import { useEventRsvp } from '@/hooks/events/use-event-rsvp';
import { useIsDesktop } from '@/hooks/use-is-desktop';
import { useServerData } from '@/hooks/use-server-data';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

const LARGE_DESKTOP_MEDIA_QUERY = '(min-width: 1200px)';

const getDefaultDecisionsPanelOpen = () => {
  const storedPreference = localStorage.getItem(
    LocalStorageKeys.DecisionsPanelOpen,
  );
  return (
    storedPreference === 'true' ||
    (storedPreference !== 'false' &&
      window.matchMedia(LARGE_DESKTOP_MEDIA_QUERY).matches)
  );
};

export const EventDetailPage = () => {
  const [isDecisionsPanelOpen, setIsDecisionsPanelOpen] = useState(
    getDefaultDecisionsPanelOpen,
  );

  const { isLoggedIn, me } = useAuthData();
  const { serverId, serverPath } = useServerData();

  const { eventId } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();

  const query = useEventQuery(serverId, eventId);
  const rsvp = useEventRsvp(serverId, eventId);
  const event = query.data?.event;

  const setRsvp = (status: 'interested' | 'going') => {
    if (!isLoggedIn) {
      toast(t('events.prompts.signInToAttend'));
      return;
    }
    rsvp.mutate(event?.currentUserStatus === status ? null : status);
  };

  useEffect(() => {
    setIsDecisionsPanelOpen(getDefaultDecisionsPanelOpen());
  }, [serverId]);

  const closeDecisionsPanel = () => {
    localStorage.setItem(LocalStorageKeys.DecisionsPanelOpen, 'false');
    setIsDecisionsPanelOpen(false);
  };

  const toggleDecisionsPanel = () => {
    const nextIsOpen = !isDecisionsPanelOpen;
    localStorage.setItem(
      LocalStorageKeys.DecisionsPanelOpen,
      String(nextIsOpen),
    );
    setIsDecisionsPanelOpen(nextIsOpen);
  };

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
          panel={
            isDesktop && isDecisionsPanelOpen ? (
              <DecisionsPanel isOpen onClose={closeDecisionsPanel} />
            ) : null
          }
          panelType="activeDecisions"
          resizeHandleLabel={t('actions.resizeRightPanel')}
          defaultSize={320}
          minSize="18rem"
          maxSize="70%"
          position="right"
        >
          <div className="flex h-full min-w-0 flex-1 flex-col">
            <TopNav
              header={event?.name || t('events.title')}
              onBackClick={() => navigate(`${serverPath}/events`)}
              showSearch={isDesktop}
              isDecisionsPanelOpen={isDecisionsPanelOpen}
              onToggleDecisionsPanel={toggleDecisionsPanel}
            />
            <main className="flex-1 overflow-y-auto p-4 sm:p-6">
              <div className="mx-auto max-w-3xl space-y-4">
                {query.isLoading && <Skeleton className="h-80 w-full" />}
                {query.isError && (
                  <p className="text-destructive">
                    {t('events.errors.loadDetail')}
                  </p>
                )}
                {event && (
                  <EventSummary {...event} eventId={event.id}>
                    <EventRsvpControls
                      currentUserStatus={event.currentUserStatus}
                      isError={rsvp.isError}
                      isPending={rsvp.isPending}
                      onChange={setRsvp}
                    />
                  </EventSummary>
                )}
              </div>
            </main>
          </div>
        </SearchPanelLayout>
      </ResizablePanel>
    </div>
  );
};
