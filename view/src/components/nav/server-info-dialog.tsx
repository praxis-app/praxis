import { SwitchServerDialog } from '@/components/nav/switch-server-dialog';
import { ServerAvatar } from '@/components/servers/server-avatar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { PRAXIS_NAME } from '@/constants/app.constants';
import { type ServerRes } from '@/types/server.types';
import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdSettings } from 'react-icons/md';
import { TbSwitchHorizontal } from 'react-icons/tb';
import { Link } from 'react-router-dom';

interface Props {
  server?: ServerRes;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  canSwitchServers?: boolean;
  manageServerPath?: string;
  onServerSelect?(): void;
  onManageServer?(): void;
  trigger?: ReactNode;
}

export const ServerInfoDialog = ({
  server,
  open,
  onOpenChange,
  canSwitchServers = false,
  manageServerPath,
  onServerSelect,
  onManageServer,
  trigger,
}: Props) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [showServerSwitchDialog, setShowServerSwitchDialog] = useState(false);

  const { t } = useTranslation();
  const serverName = server?.name || PRAXIS_NAME;
  const isOpen = open ?? internalOpen;

  const handleOpenChange = (nextOpen: boolean) => {
    if (open === undefined) {
      setInternalOpen(nextOpen);
    }
    onOpenChange?.(nextOpen);
  };

  const handleSwitchServers = () => {
    handleOpenChange(false);
    setShowServerSwitchDialog(true);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
        <DialogContent className="md:w-xl">
          <DialogHeader className="pr-10 text-left">
            <DialogTitle>{t('servers.headers.details')}</DialogTitle>
            <DialogDescription>
              {t('servers.descriptions.currentServer')}
            </DialogDescription>
          </DialogHeader>

          <Separator />

          <div className="flex min-h-44 flex-col gap-6 py-2">
            <div className="flex min-w-0 items-center gap-4">
              {server && (
                <ServerAvatar server={server} className="size-12 shrink-0" />
              )}
              <div className="min-w-0">
                <div className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  {t('servers.labels.current')}
                </div>
                <div className="truncate text-xl font-semibold">
                  {serverName}
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <div className="text-sm font-medium">
                {t('servers.form.description')}
              </div>
              <p className="text-muted-foreground mt-2 text-base leading-relaxed">
                {server?.description || t('servers.descriptions.noDescription')}
              </p>
            </div>
          </div>

          {(manageServerPath || canSwitchServers) && (
            <DialogFooter className="mt-auto gap-2 md:mt-0">
              {manageServerPath && (
                <Button
                  asChild
                  className="w-full md:w-auto"
                  onClick={() => {
                    handleOpenChange(false);
                    onManageServer?.();
                  }}
                >
                  <Link to={manageServerPath}>
                    <MdSettings />
                    {t('servers.actions.manage')}
                  </Link>
                </Button>
              )}
              {canSwitchServers && (
                <Button
                  variant="outline"
                  className="w-full md:w-auto"
                  onClick={handleSwitchServers}
                >
                  <TbSwitchHorizontal />
                  {t('navigation.labels.switchServers')}
                </Button>
              )}
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      <SwitchServerDialog
        open={showServerSwitchDialog}
        onOpenChange={setShowServerSwitchDialog}
        onSelect={onServerSelect}
      />
    </>
  );
};
