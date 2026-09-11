import {
  decisionTitle,
  responseCount,
} from '@/components/calls/call-decision-panel/call-decision-utils';
import { type PollRes } from '@/types/poll.types';
import { useTranslation } from 'react-i18next';

interface Props {
  decision?: PollRes | null;
  onOpen: () => void;
}

export const CallDecisionBanner = ({ decision, onOpen }: Props) => {
  const { t } = useTranslation();
  const title = decisionTitle(decision);
  const count = responseCount(decision);

  if (!decision) {
    return null;
  }

  return (
    <button
      type="button"
      className="bg-card hover:bg-accent mx-auto flex w-full max-w-xl cursor-pointer flex-col gap-1 overflow-hidden rounded-2xl border px-3 py-2 text-left text-sm shadow-none transition-colors select-none sm:flex-row sm:items-center sm:gap-2 sm:rounded-full dark:shadow-sm"
      onClick={onOpen}
    >
      <span className="flex w-full min-w-0 items-center justify-between gap-2 sm:w-auto sm:justify-start">
        <span className="shrink-0 font-medium whitespace-nowrap">
          {t('calls.labels.decisionInProgress')}
        </span>
        {count && (
          <span className="text-muted-foreground shrink-0 text-xs sm:hidden">
            {count}
          </span>
        )}
      </span>
      <span className="text-muted-foreground w-full min-w-0 truncate sm:flex-1">
        {title}
      </span>
      {count && (
        <span className="text-muted-foreground hidden shrink-0 sm:inline">
          {count}
        </span>
      )}
    </button>
  );
};
