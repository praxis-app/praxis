import { Button } from '@/components/ui/button';
import { cn } from '@/lib/shared.utils';
import { type EventAttendeeStatus } from '@/types/event.types';
import { useTranslation } from 'react-i18next';
import { MdCheckCircle, MdStar } from 'react-icons/md';

const RSVP_BUTTON_CLASS =
  'h-9 rounded-lg bg-transparent px-4 shadow-none hover:bg-accent';

const SELECTED_RSVP_BUTTON_CLASS =
  'border-blurple-1 text-blurple-1 hover:border-blurple-1 hover:bg-blurple-1/10 hover:text-blurple-1 dark:border-blurple-3 dark:text-blurple-3';

interface Props {
  currentUserStatus: EventAttendeeStatus | null;
  isError: boolean;
  isPending: boolean;
  onChange: (status: 'interested' | 'going') => void;
}

export const EventRsvpControls = ({
  currentUserStatus,
  isError,
  isPending,
  onChange,
}: Props) => {
  const { t } = useTranslation();
  const isHost = currentUserStatus === 'host';

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Button
          variant="outline"
          aria-pressed={currentUserStatus === 'interested'}
          className={cn(
            RSVP_BUTTON_CLASS,
            currentUserStatus === 'interested' && SELECTED_RSVP_BUTTON_CLASS,
          )}
          disabled={isHost || isPending}
          onClick={() => onChange('interested')}
        >
          <MdStar className="size-5" />
          {t('events.actions.interested')}
        </Button>
        <Button
          variant="outline"
          aria-pressed={currentUserStatus === 'going'}
          className={cn(
            RSVP_BUTTON_CLASS,
            currentUserStatus === 'going' && SELECTED_RSVP_BUTTON_CLASS,
          )}
          disabled={isHost || isPending}
          onClick={() => onChange('going')}
        >
          <MdCheckCircle className="size-5" />
          {t('events.actions.going')}
        </Button>
      </div>

      {isError && (
        <p className="text-destructive text-sm">{t('events.errors.rsvp')}</p>
      )}
    </div>
  );
};
