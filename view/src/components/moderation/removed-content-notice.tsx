import { Card } from '@/components/ui/card';
import { cn } from '@/lib/shared.utils';
import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { MdRemoveCircleOutline } from 'react-icons/md';

interface Props {
  menu?: ReactNode;
  className?: string;
}

export const RemovedContentNotice = ({ menu, className }: Props) => {
  const { t } = useTranslation();

  return (
    <Card
      className={cn(
        'before:border-l-border relative max-w-full min-w-0 flex-row items-center gap-3 rounded-md px-3 py-2 before:absolute before:top-0 before:bottom-0 before:left-0 before:mt-[-0.025rem] before:mb-[-0.025rem] before:w-3 before:rounded-l-md before:border-l-3',
        menu && 'pr-12',
        className,
      )}
    >
      <div className="bg-muted text-muted-foreground flex size-8 shrink-0 items-center justify-center rounded-full">
        <MdRemoveCircleOutline className="size-4.5" />
      </div>
      <p className="text-muted-foreground text-sm">
        {t('moderation.labels.removedByModerator')}
      </p>
      {menu}
    </Card>
  );
};
