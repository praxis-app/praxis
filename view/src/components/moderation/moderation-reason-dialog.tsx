import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  MAX_MODERATION_REASON_LENGTH,
  MIN_MODERATION_REASON_LENGTH,
} from '@/constants/moderation.constants';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  explanation?: string[];
  isReasonOptional?: boolean;
  isReasonRequired?: boolean;
  isDestructive?: boolean;
  isPending: boolean;
  onConfirm: (reason?: string) => void;
}

export const ModerationReasonDialog = ({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  explanation = [],
  isReasonOptional = false,
  isReasonRequired = false,
  isDestructive = true,
  isPending,
  onConfirm,
}: Props) => {
  const [reason, setReason] = useState('');

  const { t } = useTranslation();
  const reasonId = useId();

  const trimmedReason = reason.trim();
  const isReasonMissing =
    isReasonRequired && trimmedReason.length < MIN_MODERATION_REASON_LENGTH;

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setReason('');
    }
    onOpenChange(isOpen);
  };

  const handleConfirm = () => {
    onConfirm(trimmedReason || undefined);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="md:min-w-sm">
        <DialogHeader className="pt-3">
          <DialogTitle className="text-left">{title}</DialogTitle>
          <DialogDescription className="text-left">
            {description}
          </DialogDescription>
        </DialogHeader>

        {!!explanation.length && (
          <div className="text-muted-foreground space-y-2 text-sm">
            {explanation.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Label htmlFor={reasonId}>
            {isReasonOptional
              ? t('moderation.labels.reasonOptional')
              : t('moderation.labels.reason')}
          </Label>
          <Textarea
            id={reasonId}
            value={reason}
            maxLength={MAX_MODERATION_REASON_LENGTH}
            placeholder={t('moderation.placeholders.reason')}
            onChange={(e) => setReason(e.target.value)}
          />
          {isReasonRequired && (
            <p className="text-muted-foreground text-xs">
              {t('moderation.prompts.reasonRequired', {
                count: MIN_MODERATION_REASON_LENGTH,
              })}
            </p>
          )}
        </div>

        <DialogFooter className="flex flex-row justify-end gap-2">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            {t('actions.cancel')}
          </Button>
          <Button
            variant={isDestructive ? 'destructive' : 'default'}
            onClick={handleConfirm}
            disabled={isPending || isReasonMissing}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
