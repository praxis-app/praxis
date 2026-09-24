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
import { MAX_MODERATION_REASON_LENGTH } from '@/constants/moderation.constants';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  memberName: string;
  confirmLabel: string;
  isPending: boolean;
  onConfirm: (reason?: string) => void;
}

export const MemberModerationDialog = ({
  open,
  onOpenChange,
  title,
  memberName,
  confirmLabel,
  isPending,
  onConfirm,
}: Props) => {
  const [reason, setReason] = useState('');

  const { t } = useTranslation();
  const reasonId = useId();

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setReason('');
    }
    onOpenChange(isOpen);
  };

  const handleConfirm = () => {
    onConfirm(reason.trim() || undefined);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="md:min-w-sm">
        <DialogHeader className="pt-3">
          <DialogTitle className="text-left">{title}</DialogTitle>
          <DialogDescription className="text-left">
            {memberName}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          <Label htmlFor={reasonId}>{t('servers.labels.reason')}</Label>
          <Textarea
            id={reasonId}
            value={reason}
            maxLength={MAX_MODERATION_REASON_LENGTH}
            placeholder={t('servers.placeholders.reason')}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>

        <DialogFooter className="flex flex-row justify-end gap-2">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            {t('actions.cancel')}
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isPending}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
