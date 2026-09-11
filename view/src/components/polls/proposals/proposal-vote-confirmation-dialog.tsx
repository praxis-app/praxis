import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useTranslation } from 'react-i18next';

export type ProposalVoteConfirmationType = 'blocking' | 'ratifying';

interface Props {
  confirmationType: ProposalVoteConfirmationType | null;
  onCancel: () => void;
  onConfirm: () => void;
}

export const ProposalVoteConfirmationDialog = ({
  confirmationType,
  onCancel,
  onConfirm,
}: Props) => {
  const { t } = useTranslation();
  const isBlocking = confirmationType === 'blocking';

  return (
    <Dialog
      open={confirmationType !== null}
      onOpenChange={(open) => !open && onCancel()}
    >
      <DialogContent className="md:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {t(
              isBlocking
                ? 'proposals.headers.confirmBlockingVote'
                : 'proposals.headers.confirmRatifyingVote',
            )}
          </DialogTitle>
          <DialogDescription>
            {t(
              isBlocking
                ? 'proposals.descriptions.confirmBlockingVote'
                : 'proposals.descriptions.confirmRatifyingVote',
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-row justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            {t('actions.cancel')}
          </Button>
          <Button
            variant={isBlocking ? 'destructive' : 'default'}
            onClick={onConfirm}
          >
            {t(
              isBlocking
                ? 'proposals.actions.castBlockingVote'
                : 'proposals.actions.castRatifyingVote',
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
