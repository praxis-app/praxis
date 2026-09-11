import { LogOutDialogContent } from '@/components/auth/log-out-dialog-content';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserAvatar } from '@/components/users/user-avatar';
import { UserProfileDrawer } from '@/components/users/user-profile-drawer';
import {
  NavigationPaths,
  UserSettingsSections,
} from '@/constants/shared.constants';
import { getUserSettingsPath } from '@/lib/user-settings.utils';
import { useLogOut } from '@/hooks/use-log-out';
import { useMeQuery } from '@/hooks/use-me-query';
import { truncate } from '@/lib/text.utils';
import { useAuthStore } from '@/store/auth.store';
import { useNavStore } from '@/store/nav.store';
import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdExitToApp, MdPerson, MdSettings } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

interface Props {
  trigger: ReactNode;
}

export const NavDropdown = ({ trigger }: Props) => {
  const { isLoggedIn } = useAuthStore();
  const { setIsNavSheetOpen } = useNavStore();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const navigate = useNavigate();
  const { t } = useTranslation();

  const { mutate: logOut, isPending: isLogoutPending } = useLogOut({
    onSuccess: () => setShowLogoutDialog(false),
  });

  const { data: meData } = useMeQuery({
    enabled: isLoggedIn,
  });

  if (!meData) {
    return null;
  }

  const me = meData.user;
  const name = me.displayName || me.name;
  const truncatedUsername = truncate(name, 22);

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent
        sideOffset={12}
        className="mr-2.5 flex flex-col gap-2 p-3"
      >
        <UserProfileDrawer
          name={truncatedUsername}
          me={me}
          trigger={
            <DropdownMenuItem
              className="text-md"
              onSelect={(e) => e.preventDefault()}
            >
              <UserAvatar
                name={name}
                userId={me.id}
                imageSrc={me.profilePicture?.url}
                className="size-5"
                fallbackClassName="text-[0.7rem]"
              />
              {truncatedUsername}
            </DropdownMenuItem>
          }
        />

        {!me.anonymous && (
          <DropdownMenuItem
            onClick={() => {
              navigate(getUserSettingsPath(UserSettingsSections.Profile));
              setIsNavSheetOpen(false);
            }}
            className="text-md"
          >
            <MdPerson className="text-foreground size-5" />
            {t('users.actions.editProfile')}
          </DropdownMenuItem>
        )}

        {!me.anonymous && (
          <DropdownMenuItem
            onClick={() => {
              navigate(NavigationPaths.UserSettings);
              setIsNavSheetOpen(false);
            }}
            className="text-md"
          >
            <MdSettings className="text-foreground size-5" />
            {t('navigation.labels.userSettings')}
          </DropdownMenuItem>
        )}

        <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
          <DialogTrigger asChild>
            <DropdownMenuItem
              className="text-md"
              onSelect={(e) => e.preventDefault()}
            >
              <MdExitToApp className="text-foreground size-5" />
              {t('auth.actions.logOut')}
            </DropdownMenuItem>
          </DialogTrigger>
          <LogOutDialogContent
            handleLogout={logOut}
            isPending={isLogoutPending}
            setShowLogoutDialog={setShowLogoutDialog}
          />
        </Dialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
