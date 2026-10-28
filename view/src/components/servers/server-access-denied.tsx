import appIconImg from '@/assets/images/app-icon.png';
import { TopNav } from '@/components/nav/top-nav';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { PRAXIS_NAME } from '@/constants/app.constants';
import { useLogOut } from '@/hooks/use-log-out';
import { formatDate } from '@/lib/time.utils';
import { type ServerAccessRes } from '@/types/server.types';
import { useTranslation } from 'react-i18next';

interface Props {
  access: ServerAccessRes;
}

export const ServerAccessDenied = ({
  access: { status, serverName, reason, moderatedAt },
}: Props) => {
  const { mutate: logOut, isPending } = useLogOut();
  const { t } = useTranslation();

  const getCopy = () => {
    if (status === 'banned') {
      return {
        title: t('servers.access.bannedTitle', { serverName }),
        description: t('servers.access.bannedDescription'),
      };
    }
    if (status === 'removed') {
      return {
        title: t('servers.access.removedTitle', { serverName }),
        description: t('servers.access.removedDescription'),
      };
    }
    return {
      title: t('servers.access.noAccessTitle'),
      description: t('servers.access.noAccessDescription'),
    };
  };

  const { title, description } = getCopy();

  return (
    <>
      <TopNav
        backBtnIcon={
          <img
            src={appIconImg}
            alt={PRAXIS_NAME}
            className="size-7 self-center"
          />
        }
      />
      <Container className="space-y-5">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>

        {reason && (
          <div className="bg-muted/50 space-y-1 rounded-lg border p-4">
            <p className="text-sm font-medium">
              {t('servers.access.reasonLabel')}
            </p>
            <p className="text-sm wrap-break-word whitespace-pre-wrap">
              {reason}
            </p>
            {moderatedAt && (
              <p className="text-muted-foreground text-xs">
                {formatDate(moderatedAt)}
              </p>
            )}
          </div>
        )}

        <Button
          variant="outline"
          className="w-24"
          onClick={() => logOut()}
          disabled={isPending}
        >
          {t('auth.actions.logOut')}
        </Button>
      </Container>
    </>
  );
};
