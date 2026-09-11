import { LazyLoadImage } from '@/components/images/lazy-load-image';
import { Badge } from '@/components/ui/badge';
import { UserAvatar } from '@/components/users/user-avatar';
import { formatEventDateTime } from '@/lib/event.utils';
import { type EventRes } from '@/types/event.types';
import { useTranslation } from 'react-i18next';
import {
  LuCalendarDays,
  LuChevronRight,
  LuMapPin,
  LuUsers,
  LuVideo,
} from 'react-icons/lu';
import { Link } from 'react-router-dom';

interface Props {
  event: EventRes;
  serverPath: string;
}

export const EventListCard = ({ event, serverPath }: Props) => {
  const { t } = useTranslation();
  const status =
    event.currentUserStatus === 'host'
      ? t('events.labels.hosting')
      : event.currentUserStatus
        ? t(`events.actions.${event.currentUserStatus}`)
        : null;

  return (
    <Link
      to={`${serverPath}/events/${event.id}`}
      className="focus-visible:ring-ring group bg-card hover:border-foreground/15 block overflow-hidden rounded-xl border shadow-sm transition-[border-color,box-shadow,transform] hover:shadow-md focus-visible:ring-2 focus-visible:outline-none"
    >
      {event.coverPhoto && (
        <LazyLoadImage
          alt={t('images.labels.coverPhoto')}
          imageId={event.coverPhoto.id}
          eventId={event.id}
          className="h-36 w-full sm:h-48"
        />
      )}

      <div className="space-y-4 px-4 py-4 sm:px-5 sm:py-5">
        <div className="flex items-start justify-between gap-4">
          <div className="text-event-accent flex min-w-0 items-center gap-2 text-sm font-semibold">
            <LuCalendarDays className="size-4 shrink-0" />
            <span>{formatEventDateTime(event.startsAt, event.endsAt)}</span>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <div className="flex -space-x-2">
              {event.hosts.slice(0, 3).map((host) => (
                <UserAvatar
                  key={host.id}
                  userId={host.id}
                  name={host.displayName || host.name}
                  imageId={host.profilePicture?.id}
                  className="border-card size-7 border-2"
                  fallbackClassName="text-xs"
                />
              ))}
            </div>
            <Badge variant="secondary">
              <LuUsers />
              {t('events.labels.goingCount', { count: event.goingCount })}
            </Badge>
          </div>
        </div>

        <div className="space-y-1.5">
          <h2 className="text-xl leading-tight font-semibold tracking-tight sm:text-2xl">
            {event.name}
          </h2>
          <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed sm:text-base">
            {event.description}
          </p>
        </div>
      </div>

      <div className="text-muted-foreground flex items-center justify-between gap-3 border-t px-4 py-3 text-sm sm:px-5">
        <div className="flex min-w-0 items-center gap-2">
          {event.online ? (
            <LuVideo className="size-4 shrink-0" />
          ) : (
            <LuMapPin className="size-4 shrink-0" />
          )}
          <span className="truncate">
            {event.online ? t('events.labels.online') : event.location}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {status && <Badge variant="outline">{status}</Badge>}
          <LuChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  );
};
