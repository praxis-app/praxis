import { ServerAccessReason } from '@/components/servers/server-access-reason';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useNoticesStore } from '@/store/notices.store';
import { useTranslation } from 'react-i18next';

export const NoticeDialog = () => {
  const { notices, dismissNotice } = useNoticesStore();

  const { t } = useTranslation();

  const notice = notices[0];

  if (!notice) {
    return null;
  }

  const handleDismiss = () => dismissNotice(notice.id);

  return (
    <Dialog
      key={notice.id}
      open
      onOpenChange={(isOpen) => !isOpen && handleDismiss()}
    >
      <DialogContent
        className="md:max-w-md md:min-w-sm"
        onInteractOutside={(event) => event.preventDefault()}
      >
        <DialogHeader className="pt-3">
          <DialogTitle className="text-left">{notice.title}</DialogTitle>
          <DialogDescription className="text-left">
            {notice.description}
          </DialogDescription>
        </DialogHeader>

        <ServerAccessReason access={notice} />

        <DialogFooter className="flex flex-row justify-end">
          <Button onClick={handleDismiss}>
            {t('servers.access.acknowledge')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
