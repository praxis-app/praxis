import { useIsDesktop } from '@/hooks/use-is-desktop';
import { type CurrentUser } from '@/types/user.types';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { UserProfile } from './user-profile';

interface Props {
  trigger: ReactNode;
  userId?: string;
  me?: CurrentUser;
  name: string;
}

export const UserProfileDrawer = ({ trigger, userId, me, name }: Props) => {
  const [open, setOpen] = useState(false);

  const { t } = useTranslation();
  const isDesktop = useIsDesktop();

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setOpen(isOpen);
  };

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent className="md:p-0">
          <VisuallyHidden>
            <DialogHeader>
              <DialogTitle>{name}</DialogTitle>
              <DialogDescription>
                {t('users.prompts.viewProfile', { name })}
              </DialogDescription>
            </DialogHeader>
          </VisuallyHidden>
          <UserProfile userId={userId} me={me} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent
        className="flex min-h-[calc(100%-4.2rem)] w-full flex-col items-start rounded-t-2xl"
        drawerHandle={{
          className:
            'm-0 relative top-1.5 z-50 w-[45px] h-1.5 left-1/2 -translate-x-1/2 absolute',
        }}
      >
        <VisuallyHidden>
          <DrawerHeader>
            <DrawerTitle>{name}</DrawerTitle>
            <DrawerDescription>
              {t('users.prompts.viewProfile', { name })}
            </DrawerDescription>
          </DrawerHeader>
        </VisuallyHidden>
        <UserProfile userId={userId} me={me} className="w-full" />
      </DrawerContent>
    </Drawer>
  );
};
