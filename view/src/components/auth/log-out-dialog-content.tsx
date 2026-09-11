import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

interface Props {
  setShowLogoutDialog: (show: boolean) => void;
  handleLogout: () => void;
  isPending: boolean;
}

export const LogOutDialogContent = ({
  setShowLogoutDialog,
  handleLogout,
  isPending,
}: Props) => {
  const { t } = useTranslation();

  return (
    <DialogContent>
      <DialogHeader className="mt-9">
        <DialogTitle className="text-md font-normal">
          {t('auth.prompts.logOut')}
        </DialogTitle>
        <VisuallyHidden>
          <DialogDescription>
            {t('auth.descriptions.confirmLogOut')}
          </DialogDescription>
        </VisuallyHidden>
      </DialogHeader>

      <DialogFooter className="flex flex-row gap-2 self-center">
        <Button variant="outline" onClick={() => setShowLogoutDialog(false)}>
          {t('actions.cancel')}
        </Button>
        <Button
          variant="destructive"
          onClick={handleLogout}
          disabled={isPending}
        >
          {t('auth.actions.logOut')}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};
