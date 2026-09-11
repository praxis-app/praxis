import {
  CreateChannelForm,
  CreateChannelFormSubmitButton,
} from '@/components/channels/create-channel-form';
import { CurrentServerMenuLabel } from '@/components/nav/current-server-menu-label';
import { ServerInfoDialog } from '@/components/nav/server-info-dialog';
import { SwitchServerDialog } from '@/components/nav/switch-server-dialog';
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
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Separator } from '@/components/ui/separator';
import { PRAXIS_NAME } from '@/constants/app.constants';
import { NavigationPaths } from '@/constants/shared.constants';
import { useAbility } from '@/hooks/use-ability';
import { useMeQuery } from '@/hooks/use-me-query';
import { useServerData } from '@/hooks/use-server-data';
import { getSettingsAccess } from '@/lib/role.utils';
import { useNavStore } from '@/store/nav.store';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdAddCircle, MdSettings } from 'react-icons/md';
import { TbSwitchHorizontal } from 'react-icons/tb';
import { useNavigate } from 'react-router-dom';

interface Props {
  trigger: ReactNode;
}

export const NavDrawer = ({ trigger }: Props) => {
  const { setIsNavSheetOpen } = useNavStore();
  const [showNavDrawer, setShowNavDrawer] = useState(false);
  const [showRoomFormDialog, setShowRoomFormDialog] = useState(false);
  const [showServerSwitchDialog, setShowServerSwitchDialog] = useState(false);

  const { t } = useTranslation();
  const navigate = useNavigate();

  const { serverAbility, instanceAbility } = useAbility();
  const { server, serverPath } = useServerData();
  const { data: meData } = useMeQuery();

  const canManageChannels = serverAbility.can('manage', 'Channel');
  const { canManageServers, canManageServerSettings, hasSettingsAccess } =
    getSettingsAccess(serverAbility, instanceAbility);

  const serverName = server?.name || PRAXIS_NAME;
  const hasMultipleServers = !!meData && meData.user.serversCount > 1;

  const hasServerMenuActions =
    canManageChannels || hasSettingsAccess || hasMultipleServers;

  const manageServerPath = canManageServerSettings
    ? `${serverPath}${NavigationPaths.GeneralSettings}`
    : canManageServers && server
      ? `${NavigationPaths.ManageServers}/${server.id}/edit`
      : undefined;

  return (
    <>
      <Drawer open={showNavDrawer} onOpenChange={setShowNavDrawer}>
        <DrawerTrigger asChild>{trigger}</DrawerTrigger>

        <DrawerContent className="flex min-h-[calc(100%-68px)] flex-col items-start rounded-t-2xl border-0">
          <VisuallyHidden>
            <DrawerHeader>
              <DrawerTitle>{t('navigation.titles.navDrawer')}</DrawerTitle>
              <DrawerDescription>
                {t('navigation.descriptions.navDrawer')}
              </DrawerDescription>
            </DrawerHeader>
          </VisuallyHidden>

          <div className="flex w-full flex-col items-start gap-4 p-5">
            <ServerInfoDialog
              server={server}
              canSwitchServers={hasMultipleServers}
              manageServerPath={manageServerPath}
              onManageServer={() => {
                setShowNavDrawer(false);
                setIsNavSheetOpen(false);
              }}
              onServerSelect={() => {
                setShowNavDrawer(false);
                setIsNavSheetOpen(false);
              }}
              trigger={
                <Button
                  variant="ghost"
                  className="text-md h-auto w-full justify-start py-2.5"
                >
                  <CurrentServerMenuLabel
                    serverName={serverName}
                    server={server}
                  />
                </Button>
              }
            />

            {hasServerMenuActions && <Separator />}

            {canManageChannels && (
              <Dialog
                open={showRoomFormDialog}
                onOpenChange={setShowRoomFormDialog}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    className="text-md flex items-center gap-6 font-normal"
                  >
                    <MdAddCircle className="size-6" />
                    {t('channels.actions.create')}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {t('channels.prompts.createChannel')}
                    </DialogTitle>
                    <DialogDescription>
                      {t('channels.prompts.startConversation')}
                    </DialogDescription>
                  </DialogHeader>

                  <CreateChannelForm
                    submitButton={(props) => (
                      <DialogFooter>
                        <CreateChannelFormSubmitButton {...props} />
                      </DialogFooter>
                    )}
                    onSubmit={() => {
                      setShowNavDrawer(false);
                      setShowRoomFormDialog(false);
                      setIsNavSheetOpen(false);
                    }}
                  />
                </DialogContent>
              </Dialog>
            )}

            {hasSettingsAccess && (
              <Button
                variant="ghost"
                className="text-md flex items-center gap-6 font-normal"
                onClick={() => {
                  navigate(`${serverPath}${NavigationPaths.Settings}`);
                  setIsNavSheetOpen(false);
                }}
              >
                <MdSettings className="size-6" />
                {t('navigation.labels.settings')}
              </Button>
            )}

            {hasMultipleServers && (
              <Button
                variant="ghost"
                className="text-md flex items-center gap-6 font-normal"
                onClick={() => setShowServerSwitchDialog(true)}
              >
                <TbSwitchHorizontal className="size-6" />
                {t('navigation.labels.switchServers')}
              </Button>
            )}
          </div>
        </DrawerContent>
      </Drawer>

      <SwitchServerDialog
        open={showServerSwitchDialog}
        onOpenChange={setShowServerSwitchDialog}
        onSelect={() => setIsNavSheetOpen(false)}
      />
    </>
  );
};
