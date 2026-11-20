import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ModerationReasonForm } from './moderation-reason-form';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  explanation?: string[];
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
  isReasonRequired = false,
  isDestructive = true,
  isPending,
  onConfirm,
}: Props) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
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

      <ModerationReasonForm
        confirmLabel={confirmLabel}
        isReasonRequired={isReasonRequired}
        isDestructive={isDestructive}
        isPending={isPending}
        onCancel={() => onOpenChange(false)}
        onConfirm={onConfirm}
      />
    </DialogContent>
  </Dialog>
);
