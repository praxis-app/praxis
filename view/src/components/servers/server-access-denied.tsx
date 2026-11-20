import appIconImg from '@/assets/images/app-icon.png';
import { TopNav } from '@/components/nav/top-nav';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { PRAXIS_NAME } from '@/constants/app.constants';
import { useLogOut } from '@/hooks/use-log-out';
import { getServerAccessCopy } from '@/lib/server-access.utils';
import { type ServerAccessRes } from '@/types/server.types';
import { useTranslation } from 'react-i18next';
import { ServerAccessReason } from './server-access-reason';

interface Props {
  access: ServerAccessRes;
}

export const ServerAccessDenied = ({ access }: Props) => {
  const { mutate: logOut, isPending } = useLogOut();
  const { t } = useTranslation();

  const { title, description } = getServerAccessCopy(access);

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

        <ServerAccessReason access={access} />

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
