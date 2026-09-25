import { handleError } from '@/lib/error.utils';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ModerationReasonDialog } from './moderation-reason-dialog';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  onRemove: (reason?: string) => Promise<unknown>;
}

export const RemoveContentDialog = ({
  open,
  onOpenChange,
  title,
  onRemove,
}: Props) => {
  const { t } = useTranslation();

  const { mutate: remove, isPending } = useMutation({
    mutationFn: onRemove,
    onSuccess: () => onOpenChange(false),
    onError: handleError,
  });

  return (
    <ModerationReasonDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={t('moderation.explanations.removeContent')}
      confirmLabel={t('moderation.actions.remove')}
      isReasonOptional
      isPending={isPending}
      onConfirm={(reason) => remove(reason)}
    />
  );
};
