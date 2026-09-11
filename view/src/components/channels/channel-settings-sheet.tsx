import { type ChannelRes } from '@/types/channel.types';
import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../ui/sheet';
import { ChannelSettingsForm } from './channel-settings-form';

interface Props {
  editChannel: ChannelRes;
  trigger: ReactNode;
}

export const ChannelSettingsSheet = ({ editChannel, trigger }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent
        side="left"
        className="bg-accent dark:bg-background min-w-full border-r-0 pt-4"
      >
        <SheetHeader className="pb-4">
          <SheetTitle>{t('channels.headers.channelSettings')}</SheetTitle>
          <SheetDescription>
            {t('channels.headers.channelSettingsDescription')}
          </SheetDescription>
        </SheetHeader>

        <ChannelSettingsForm
          editChannel={editChannel}
          onSuccess={() => setIsOpen(false)}
        />
      </SheetContent>
    </Sheet>
  );
};
