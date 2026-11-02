import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getServerAccessCopy } from '@/lib/server-access.utils';
import { useServerAccessStore } from '@/store/server-access.store';
import { useTranslation } from 'react-i18next';
import { ServerAccessReason } from './server-access-reason';

export const ServerAccessNoticeDialog = () => {
  const { notices, dismissNotice } = useServerAccessStore();

  const { t } = useTranslation();

  const notice = notices[0];

  if (!notice) {
    return null;
  }

  const { title, description } = getServerAccessCopy(notice.access);
  const handleDismiss = () => dismissNotice(notice.serverSlug);

  return (
    <Dialog
      key={notice.serverSlug}
      open
      onOpenChange={(isOpen) => !isOpen && handleDismiss()}
    >
      <DialogContent
        className="md:min-w-sm"
        onInteractOutside={(event) => event.preventDefault()}
      >
        <DialogHeader className="pt-3">
          <DialogTitle className="text-left">{title}</DialogTitle>
          <DialogDescription className="text-left">
            {description}
          </DialogDescription>
        </DialogHeader>

        <ServerAccessReason access={notice.access} />

        <DialogFooter className="flex flex-row justify-end">
          <Button onClick={handleDismiss}>
            {t('servers.access.acknowledge')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
