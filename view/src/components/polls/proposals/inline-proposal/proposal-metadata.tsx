import { MIDDOT_WITH_SPACES } from '@/constants/shared.constants';
import { cn } from '@/lib/shared.utils';
import {
  ACTION_TRANSLATION_KEYS,
  MODEL_TRANSLATION_KEYS,
  SHORT_ACTION_TRANSLATION_KEYS,
  SHORT_MODEL_TRANSLATION_KEYS,
} from '@/components/polls/proposals/inline-proposal/proposal-metadata.constants';
import { shortTimeAgo, timeAgo } from '@/lib/time.utils';
import { type PollActionType } from '@/types/poll-action.types';
import { type DecisionMakingModel } from '@/types/poll.types';
import { useTranslation } from 'react-i18next';
import {
  LuCalendarDays,
  LuFlaskConical,
  LuListCheck,
  LuMessageSquare,
  LuSettings,
  LuUserCog,
  LuUserPlus,
} from 'react-icons/lu';

interface Props {
  decisionMakingModel: DecisionMakingModel;
  actionType?: PollActionType;
  createdAt?: string;
  variant?: 'inline' | 'forum';
  onClick: () => void;
}

const actionIcons: Record<PollActionType, typeof LuMessageSquare> = {
  general: LuMessageSquare,
  'change-settings': LuSettings,
  'change-role': LuUserCog,
  'create-role': LuUserPlus,
  'plan-event': LuCalendarDays,
  test: LuFlaskConical,
};

export const ProposalMetadata = ({
  decisionMakingModel,
  actionType,
  createdAt,
  variant = 'inline',
  onClick,
}: Props) => {
  const { t } = useTranslation();

  const shortActionKey = actionType
    ? SHORT_ACTION_TRANSLATION_KEYS[actionType]
    : null;

  const modelKey = MODEL_TRANSLATION_KEYS[decisionMakingModel];
  const shortModelKey = SHORT_MODEL_TRANSLATION_KEYS[decisionMakingModel];
  const actionKey = actionType ? ACTION_TRANSLATION_KEYS[actionType] : null;

  const ActionIcon = actionType ? actionIcons[actionType] : null;

  return (
    <button
      type="button"
      className={cn(
        'text-muted-foreground focus-visible:ring-ring flex max-w-full min-w-0 cursor-pointer items-start rounded-sm pr-8 text-left text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none',
        variant === 'forum'
          ? 'flex-row flex-wrap items-center gap-y-1'
          : 'flex-col gap-y-1 @sm:flex-row @sm:flex-wrap @sm:items-center',
      )}
      onClick={onClick}
    >
      {actionType && ActionIcon && (
        <span className="flex items-center whitespace-nowrap">
          <span className="flex items-center gap-1.5">
            <ActionIcon className="size-4" aria-hidden="true" />
            {shortActionKey === actionKey ? (
              <span>{t(actionKey!)}</span>
            ) : (
              <>
                <span className="@sm:hidden">{t(shortActionKey!)}</span>
                <span className="hidden @sm:inline">{t(actionKey!)}</span>
              </>
            )}
          </span>
          <span
            className={cn('px-1.5', variant !== 'forum' && 'hidden @sm:inline')}
            aria-hidden="true"
          >
            {MIDDOT_WITH_SPACES.trim()}
          </span>
        </span>
      )}

      <span className="flex items-center whitespace-nowrap">
        <span className="flex items-center gap-1.5">
          <LuListCheck className="size-4" aria-hidden="true" />
          {shortModelKey === modelKey ? (
            <span>{t(modelKey)}</span>
          ) : (
            <>
              <span className="@sm:hidden">{t(shortModelKey)}</span>
              <span className="hidden @sm:inline">{t(modelKey)}</span>
            </>
          )}
        </span>
        {createdAt && (
          <span
            className={cn('px-1.5', variant !== 'forum' && 'hidden @sm:inline')}
            aria-hidden="true"
          >
            {MIDDOT_WITH_SPACES.trim()}
          </span>
        )}
      </span>

      {createdAt && (
        <>
          <span className="whitespace-nowrap @sm:hidden">
            {shortTimeAgo(createdAt)}
          </span>
          <span className="hidden whitespace-nowrap @sm:inline">
            {timeAgo(createdAt)}
          </span>
        </>
      )}
    </button>
  );
};
