import { useAbility } from '@/hooks/use-ability';
import { useIsDesktop } from '@/hooks/use-is-desktop';
import { type ChannelRes } from '@/types/channel.types';
import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BiTrash } from 'react-icons/bi';
import { MdChevronRight, MdSettings, MdTag } from 'react-icons/md';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '../ui/drawer';
import { Separator } from '../ui/separator';
import { ChannelSettingsSheet } from './channel-settings-sheet';
import {
  DeleteChannelForm,
  DeleteChannelFormSubmitButton,
} from './delete-channel-form';

interface Props {
  channel: ChannelRes;
  trigger: ReactNode;
}

export const ChannelDetailsDrawer = ({ channel, trigger }: Props) => {
  const [showDeleteChannelDialog, setShowDeleteChannelDialog] = useState(false);

  const { t } = useTranslation();
  const isDesktop = useIsDesktop();

  const { serverAbility } = useAbility();
  const canManageChannels = serverAbility.can('manage', 'Channel');

  return (
    <Drawer>
      {isDesktop ? trigger : <DrawerTrigger asChild>{trigger}</DrawerTrigger>}

      <DrawerContent className="flex min-h-[calc(100%-3.5rem)] flex-col items-start rounded-t-2xl border-0">
        <DrawerHeader className="w-full pt-5 pb-6">
          <DrawerTitle className="flex items-center justify-center gap-0.5 text-center text-[1.3rem]">
            <MdTag className="mt-0.5 size-6" />
            <div className="tracking-[0.015rem]">{channel.name}</div>
          </DrawerTitle>
          <DrawerDescription className="mt-4 mb-1 text-balance">
            {channel.description?.trim() ||
              t('channels.descriptions.noDescription')}
          </DrawerDescription>
        </DrawerHeader>

        {canManageChannels && (
          <>
            <Separator />

            <ChannelSettingsSheet
              trigger={
                <Button
                  className="text-primary mx-auto mt-6 h-[3.2rem] w-[92%] justify-between"
                  variant="secondary"
                  size="lg"
                >
                  <div className="flex items-center gap-3">
                    <MdSettings className="text-muted-foreground size-6.5" />
                    <div>{t('channels.headers.channelSettings')}</div>
                  </div>

                  <MdChevronRight className="text-muted-foreground size-5.5" />
                </Button>
              }
              editChannel={channel}
            />

            <Dialog
              open={showDeleteChannelDialog}
              onOpenChange={setShowDeleteChannelDialog}
            >
              {canManageChannels && (
                <DialogTrigger asChild>
                  <Button
                    className="text-destructive mx-auto mt-6 h-[3.2rem] w-[92%] justify-start gap-3"
                    variant="secondary"
                    size="lg"
                  >
                    <BiTrash className="size-5" />
                    {t('channels.actions.delete')}
                  </Button>
                </DialogTrigger>
              )}

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('channels.actions.delete')}</DialogTitle>
                  <DialogDescription className="pt-3.5">
                    {t('prompts.deleteItem', {
                      itemType: t('channels.labels.channel'),
                    })}
                  </DialogDescription>
                </DialogHeader>

                <DeleteChannelForm
                  channel={channel}
                  submitButton={(props) => (
                    <DialogFooter>
                      <DeleteChannelFormSubmitButton {...props} />
                    </DialogFooter>
                  )}
                  onSubmit={() => setShowDeleteChannelDialog(false)}
                />
              </DialogContent>
            </Dialog>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
};
