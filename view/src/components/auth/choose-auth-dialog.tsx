import { api } from '@/client/api-client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import {
  LocalStorageKeys,
  NavigationPaths,
} from '@/constants/shared.constants';
import { useAuthData } from '@/hooks/use-auth-data';
import { useServerData } from '@/hooks/use-server-data';
import { handleError } from '@/lib/error.utils';
import { useAuthStore } from '@/store/auth.store';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

interface Props {
  isOpen: boolean;
  setIsOpen(isOpen: boolean): void;
  sendMessage(): Promise<void>;
}

export const ChooseAuthDialog = ({ isOpen, setIsOpen, sendMessage }: Props) => {
  const { inviteToken, setIsLoggedIn, setAccessToken, setInviteToken } =
    useAuthStore((state) => state);

  const { serverId } = useServerData();
  const { signUpPath } = useAuthData();

  const { t } = useTranslation();
  const navigate = useNavigate();

  const {
    data: isAnonymousUsersEnabledData,
    isLoading: isAnonymousUsersEnabledLoading,
  } = useQuery({
    queryKey: ['servers', serverId, 'configs', 'anon-enabled'],
    queryFn: () => api.isAnonymousUsersEnabled(serverId!),
    enabled: !!serverId && isOpen,
  });

  const { mutate: createAnonSession } = useMutation({
    mutationFn: async () => {
      const { access_token } = await api.createAnonSession(inviteToken);
      localStorage.setItem(LocalStorageKeys.AccessToken, access_token);
      localStorage.removeItem(LocalStorageKeys.InviteToken);
      setAccessToken(access_token);
      setInviteToken(null);
      setIsLoggedIn(true);
      sendMessage();
    },
    onError(error: Error) {
      handleError(error);
      setIsOpen(false);
    },
  });

  const handleSendAnonMsgBtnClick = () => {
    createAnonSession();
    setIsOpen(false);
  };

  const isAnonymousUsersEnabled =
    !!isAnonymousUsersEnabledData?.anonymousUsersEnabled;

  const renderTitle = () => {
    if (isAnonymousUsersEnabledLoading) {
      return (
        <div className="flex flex-col gap-3 md:min-w-112.5">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
        </div>
      );
    }
    if (!isAnonymousUsersEnabled) {
      return t('auth.prompts.signUpToChat');
    }
    return t('auth.prompts.chooseAuthFlow');
  };

  const renderFooter = () => {
    if (isAnonymousUsersEnabledLoading) {
      return (
        <div className="flex w-full justify-center gap-2 md:justify-end">
          <Skeleton className="h-10 w-[25%]" />
          <Skeleton className="h-10 w-[25%]" />
        </div>
      );
    }
    return (
      <DialogFooter className="flex flex-row gap-2 self-center">
        {isAnonymousUsersEnabled ? (
          <Button onClick={handleSendAnonMsgBtnClick} variant="outline">
            {t('messages.actions.sendAnonymous')}
          </Button>
        ) : (
          <Button
            onClick={() => navigate(NavigationPaths.Login)}
            variant="outline"
          >
            {t('auth.actions.logIn')}
          </Button>
        )}
        <Button onClick={() => navigate(signUpPath)}>
          {t('auth.actions.signUp')}
        </Button>
      </DialogFooter>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader className="mt-9">
          <DialogTitle className="text-md font-normal">
            {renderTitle()}
          </DialogTitle>
          <VisuallyHidden>
            <DialogDescription>
              {t('auth.prompts.chooseAuthFlow')}
            </DialogDescription>
          </VisuallyHidden>
        </DialogHeader>

        {renderFooter()}
      </DialogContent>
    </Dialog>
  );
};
