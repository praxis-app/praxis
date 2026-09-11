import { EventListCard } from '@/components/events/event-list-card';
import { type EventRes } from '@/types/event.types';
import { useTranslation } from 'react-i18next';
import { LuCalendarDays } from 'react-icons/lu';

interface Props {
  events: EventRes[];
  serverPath: string;
}

export const EventsList = ({ events, serverPath }: Props) => {
  const { t } = useTranslation();

  return (
    <section className="mx-auto w-full max-w-3xl space-y-4">
      <div className="flex items-center gap-2 px-1">
        <LuCalendarDays className="text-muted-foreground size-5" />
        <h2 className="font-semibold">
          {t('events.list.count', { count: events.length })}
        </h2>
      </div>
      <div className="space-y-4">
        {events.map((event) => (
          <EventListCard key={event.id} event={event} serverPath={serverPath} />
        ))}
      </div>
    </section>
  );
};
