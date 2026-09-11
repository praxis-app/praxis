import { EventUserAvatars } from '@/components/events/event-user-avatars';
import { LazyLoadImage } from '@/components/images/lazy-load-image';
import { FormattedText } from '@/components/shared/formatted-text';
import { formatEventDateTime, formatEventDuration } from '@/lib/event.utils';
import { cn } from '@/lib/shared.utils';
import { type ImageRes } from '@/types/image.types';
import { type UserRes } from '@/types/user.types';
import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  MdGroups,
  MdLink,
  MdLocationOn,
  MdPeople,
  MdSchedule,
  MdVideocam,
} from 'react-icons/md';

interface Props {
  name: string;
  description: string;
  startsAt: string;
  endsAt?: string | null;
  online: boolean;
  location?: string | null;
  externalLink?: string | null;
  hosts: UserRes[];
  goingCount?: number;
  interestedCount?: number;
  going?: UserRes[];
  interested?: UserRes[];
  coverPhoto?: ImageRes | null;
  coverPhotoFile?: File;
  channelId?: string;
  pollId?: string;
  eventId?: string;
  layout?: 'standalone' | 'nested';
  children?: ReactNode;
}

export const EventSummary = ({
  name,
  description,
  startsAt,
  endsAt,
  online,
  location,
  externalLink,
  hosts,
  goingCount,
  interestedCount,
  going,
  interested,
  coverPhoto,
  coverPhotoFile,
  channelId,
  pollId,
  eventId,
  layout = 'standalone',
  children,
}: Props) => {
  const { t } = useTranslation();

  const eventType = online
    ? t('events.labels.online')
    : t('events.labels.inPerson');

  const coverPhotoSrc = coverPhotoFile
    ? URL.createObjectURL(coverPhotoFile)
    : undefined;

  const hasCoverPhoto = !!coverPhotoSrc || !!coverPhoto;

  const attendees = [...(interested || []), ...(going || [])];
  const duration = formatEventDuration(startsAt, endsAt);
  const isNested = layout === 'nested';

  const coverPhotoElement = hasCoverPhoto && (
    <LazyLoadImage
      alt={t('images.labels.coverPhoto')}
      src={coverPhotoSrc}
      imageId={coverPhoto?.id}
      channelId={channelId}
      pollId={pollId}
      eventId={eventId}
      eventCoverPhoto={!!pollId}
      className={cn('h-36 w-full', isNested ? 'rounded-lg' : 'rounded-none')}
    />
  );

  return (
    <div
      className={cn(
        'min-w-0',
        isNested
          ? 'px-1'
          : 'bg-card overflow-hidden rounded-xl border shadow-[0_8px_18px_-14px_rgb(0_0_0/0.12)]',
      )}
    >
      {coverPhotoElement && (
        <div className={cn(isNested && 'pb-4')}>{coverPhotoElement}</div>
      )}
      <div className={cn(!isNested && 'px-5 py-5')}>
        <div className="pb-5">
          <p className="text-event-accent text-sm leading-relaxed font-medium tracking-wide uppercase">
            {formatEventDateTime(startsAt, endsAt)}
          </p>
          <h3 className="mt-2 text-lg leading-tight font-medium tracking-tight sm:text-xl">
            {name}
          </h3>
          {children && <div className="mt-4">{children}</div>}
        </div>

        <div className="text-muted-foreground space-y-0.5 pb-5 text-sm">
          {goingCount !== undefined && interestedCount !== undefined && (
            <div className="flex min-h-6 min-w-0 items-center gap-2.5">
              <MdGroups className="text-muted-foreground size-4 shrink-0" />
              <div className="flex min-w-0 items-center gap-2">
                <EventUserAvatars users={attendees} />
                <span>
                  {interestedCount > 0 && (
                    <>
                      {interestedCount} {t('events.labels.interested')}
                    </>
                  )}
                  {interestedCount > 0 && goingCount > 0 && ' · '}
                  {goingCount > 0 && (
                    <>
                      {goingCount} {t('events.labels.going')}
                    </>
                  )}
                </span>
              </div>
            </div>
          )}

          <div className="flex min-h-6 min-w-0 items-center gap-2.5">
            <MdPeople className="text-muted-foreground size-4 shrink-0" />
            <div className="flex min-w-0 items-center gap-2">
              <EventUserAvatars users={hosts} />
              <span className="min-w-0 truncate">
                {t('events.labels.hostedBy', {
                  names: hosts
                    .map((host) => host.displayName || host.name)
                    .join(', '),
                })}
              </span>
            </div>
          </div>

          {duration && (
            <div className="flex min-h-6 min-w-0 items-center gap-2.5">
              <MdSchedule className="text-muted-foreground size-4 shrink-0" />
              <span>
                {t('events.labels.duration')}: {duration}
              </span>
            </div>
          )}

          {externalLink && (
            <a
              className="text-primary flex min-h-6 min-w-0 items-center gap-2.5 hover:underline"
              href={externalLink}
              target="_blank"
              rel="noreferrer"
            >
              <MdLink className="text-muted-foreground size-4 shrink-0" />
              <span className="truncate">{externalLink}</span>
            </a>
          )}

          <div className="flex min-h-6 min-w-0 items-center gap-2.5">
            {online ? (
              <MdVideocam className="text-muted-foreground size-4 shrink-0" />
            ) : (
              <MdLocationOn className="text-muted-foreground size-4 shrink-0" />
            )}
            <span className="min-w-0 truncate">
              {online ? eventType : location}
            </span>
          </div>
        </div>

        {description && (
          <div className="border-t pt-4">
            <p className="mb-2 text-base font-medium">
              {t('events.headers.whatToExpect')}
            </p>
            <FormattedText
              text={description}
              className="text-sm leading-relaxed"
            />
          </div>
        )}
      </div>
    </div>
  );
};
