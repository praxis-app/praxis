import appIconImg from '@/assets/images/app-icon.png';
import { api } from '@/client/api-client';
import { NavDrawer } from '@/components/nav/nav-drawer';
import { NavDropdown } from '@/components/nav/nav-dropdown';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { UserAvatar } from '@/components/users/user-avatar';
import { NavigationPaths } from '@/constants/shared.constants';
import { useAuthData } from '@/hooks/use-auth-data';
import { useServerData } from '@/hooks/use-server-data';
import { useUnreadChannels } from '@/hooks/use-unread-channels';
import { cn } from '@/lib/shared.utils';
import { useAuthStore } from '@/store/auth.store';
import { useNavStore } from '@/store/nav.store';
import { PRAXIS_NAME } from '@/constants/app.constants';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useQuery } from '@tanstack/react-query';
import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { LuChevronRight } from 'react-icons/lu';
import {
  MdExitToApp,
  MdEvent,
  MdForum,
  MdPersonAdd,
  MdRocketLaunch,
  MdTag,
} from 'react-icons/md';
import { Link, useNavigate } from 'react-router-dom';

interface Props {
  trigger: ReactNode;
}

export const NavSheet = ({ trigger }: Props) => {
  const { isNavSheetOpen, setIsNavSheetOpen } = useNavStore();
  const { inviteToken } = useAuthStore();

  const { t } = useTranslation();
  const navigate = useNavigate();

  const { me, isLoggedIn, signUpPath, showSignUp, isMeSuccess } = useAuthData();

  const { serverId, serverPath } = useServerData();
  const { unreadChannelIds } = useUnreadChannels();

  const { data: joinedChannelsData } = useQuery({
    queryKey: ['servers', serverId, 'channels', 'joined'],
    queryFn: async () => {
      if (!serverId) {
        throw new Error('Current server not found');
      }
      return api.getJoinedChannels(serverId);
    },
    enabled: isNavSheetOpen && !!serverId && isMeSuccess,
  });

  const { data: publicChannelsData } = useQuery({
    queryKey: ['servers', serverId, 'channels', inviteToken],
    queryFn: async () => {
      if (!serverId) {
        throw new Error('Current server not found');
      }
      return api.getChannels(serverId);
    },
    enabled: isNavSheetOpen && !!serverId && !me,
  });

  const channels =
    joinedChannelsData?.channels || publicChannelsData?.channels || [];

  const channelsPath = `${serverPath}/c`;
  const name = me?.displayName || me?.name;

  return (
    <Sheet open={isNavSheetOpen} onOpenChange={setIsNavSheetOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent
        side="left"
        className="bg-accent dark:bg-background min-w-full border-r-0 px-0 pt-4"
        onEscapeKeyDown={(e) => e.preventDefault()}
        hideCloseButton
      >
        <SheetHeader className="space-y-4">
          <SheetTitle className="flex items-center justify-between pr-6">
            <NavDrawer
              trigger={
                <button
                  type="button"
                  className="focus-visible:ring-ring flex cursor-pointer items-center gap-2 self-center rounded-md px-6 font-medium tracking-[0.02em] focus-visible:ring-2 focus-visible:outline-none"
                >
                  <img
                    src={appIconImg}
                    alt={PRAXIS_NAME}
                    className="size-9 self-center"
                  />
                  <div className="truncate">{PRAXIS_NAME}</div>
                  <LuChevronRight className="mt-0.5 size-4 shrink-0" />
                </button>
              }
            />
            {me && (
              <NavDropdown
                trigger={
                  <UserAvatar
                    name={name || ''}
                    userId={me.id}
                    imageSrc={me.profilePicture?.url}
                    className="size-9"
                    fallbackClassName="text-[1.05rem]"
                  />
                }
              />
            )}
          </SheetTitle>
          <VisuallyHidden>
            <SheetDescription>
              {t('navigation.descriptions.navSheet')}
            </SheetDescription>
          </VisuallyHidden>
        </SheetHeader>

        <div className="bg-background dark:bg-card flex h-full w-full flex-col gap-6 overflow-y-auto rounded-t-2xl px-4 pt-7 pb-12">
          {/* TODO: Add visual indicator for current channel */}

          <Link
            to={`${serverPath}${NavigationPaths.Events}`}
            onClick={() => setIsNavSheetOpen(false)}
            className="flex items-center gap-1.5 text-lg tracking-[0.01em]"
          >
            <MdEvent className="mr-1 size-6" />
            <div>{t('navigation.labels.events')}</div>
          </Link>

          <Separator />

          {channels.map((channel) => (
            <Link
              key={channel.id}
              to={`${channelsPath}/${channel.id}`}
              onClick={() => setIsNavSheetOpen(false)}
              className="relative flex items-center gap-1.5 text-lg tracking-[0.01em]"
            >
              {unreadChannelIds.includes(channel.id) && (
                <span
                  className="bg-foreground absolute top-1/2 -left-4 h-2 w-1 -translate-y-1/2 rounded-r-full"
                  data-testid="channel-unread-indicator"
                  aria-hidden
                />
              )}
              {channel.channelType === 'forum' ? (
                <MdForum className="mr-1 size-6" />
              ) : (
                <MdTag className="mr-1 size-6" />
              )}
              <div
                className={cn(
                  unreadChannelIds.includes(channel.id) && 'font-medium',
                )}
              >
                {channel.name}
              </div>
            </Link>
          ))}

          <div className="flex flex-col gap-4">
            <Separator />

            {showSignUp && (
              <Button
                variant="ghost"
                className="w-full justify-start text-base font-light"
                onClick={() => {
                  navigate(signUpPath);
                  setIsNavSheetOpen(false);
                }}
              >
                <MdPersonAdd className="mr-1 size-6" />
                {t('auth.actions.signUp')}
              </Button>
            )}

            {!isLoggedIn && (
              <Button
                variant="ghost"
                className="w-full justify-start px-0 text-lg font-normal has-[>svg]:px-0"
                onClick={() => {
                  navigate(NavigationPaths.Login);
                  setIsNavSheetOpen(false);
                }}
              >
                <MdExitToApp className="mr-1 size-6" />
                {t('auth.actions.logIn')}
              </Button>
            )}

            <Button
              variant="ghost"
              className="w-full justify-start px-0 text-lg font-normal has-[>svg]:px-0"
              onClick={() => {
                navigate(NavigationPaths.About);
                setIsNavSheetOpen(false);
              }}
            >
              <MdRocketLaunch className="mr-1 size-6" />
              {t('landing.actions.backToLanding')}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
