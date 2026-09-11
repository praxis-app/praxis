import { EventSummary } from '@/components/events/event-summary';
import { LazyLoadImage } from '@/components/images/lazy-load-image';
import { Button } from '@/components/ui/button';
import { useServerData } from '@/hooks/use-server-data';
import { type PollActionRes } from '@/types/poll-action.types';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ProposalActionAccordion } from './proposal-action-accordion';

export const ProposalActionEvent = ({
  action,
  channelId,
  pollId,
}: {
  action: PollActionRes;
  channelId: string;
  pollId: string;
}) => {
  const { t } = useTranslation();
  const { serverPath } = useServerData();
  if (!action.event) return null;
  const coverPhoto = action.event.coverPhoto;
  return (
    <ProposalActionAccordion
      value="event"
      ariaLabel={t('proposals.labels.plannedEvent', {
        name: action.event.name,
      })}
      summary={
        <span className="flex min-w-0 items-center gap-2">
          <span className="shrink-0">
            {t('proposals.labels.eventProposal')}:
          </span>
          {coverPhoto && (
            <LazyLoadImage
              alt={t('images.labels.coverPhoto')}
              src={coverPhoto.src}
              imageId={coverPhoto.id}
              channelId={channelId}
              pollId={pollId}
              eventCoverPhoto
              className="size-4 shrink-0 rounded-full"
            />
          )}
          <span className="truncate font-normal">{action.event.name}</span>
        </span>
      }
    >
      <div className="sm:col-span-2">
        <EventSummary
          {...action.event}
          channelId={channelId}
          pollId={pollId}
          layout="nested"
        />
        {action.event.createdEventId && (
          <Button
            asChild
            variant="link"
            className="text-muted-foreground hover:text-foreground mt-3 ml-1 h-auto px-0"
            size="sm"
          >
            <Link to={`${serverPath}/events/${action.event.createdEventId}`}>
              {t('events.actions.viewEvent')}
            </Link>
          </Button>
        )}
      </div>
    </ProposalActionAccordion>
  );
};
