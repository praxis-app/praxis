import { type PollStage } from '@/types/poll.types';
import { useTranslation } from 'react-i18next';
import { LuEyeOff } from 'react-icons/lu';

export const HiddenPollLabel = ({ stage }: { stage: PollStage }) => {
  const { t } = useTranslation();

  return (
    <p className="text-muted-foreground flex items-center gap-1.5 pr-8 text-sm">
      <LuEyeOff className="size-4 shrink-0" aria-hidden="true" />
      {t(
        stage === 'voting'
          ? 'moderation.labels.hiddenVotingPaused'
          : 'moderation.labels.hiddenByModerator',
      )}
    </p>
  );
};
