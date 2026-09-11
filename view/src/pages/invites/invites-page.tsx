import { api } from '@/client/api-client';
import { InviteCard } from '@/components/invites/invite-card';
import { InviteForm } from '@/components/invites/invite-form';
import { InvitesTable } from '@/components/invites/invites-table';
import { TopNav } from '@/components/nav/top-nav';
import { Card, CardContent } from '@/components/ui/card';
import { NavigationPaths } from '@/constants/shared.constants';
import { useIsDesktop } from '@/hooks/use-is-desktop';
import { useAuthStore } from '@/store/auth.store';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useServerData } from '../../hooks/use-server-data';

export const InvitesPage = () => {
  const { isLoggedIn } = useAuthStore();

  const { t } = useTranslation();
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();

  const { serverId, serverPath } = useServerData();

  const { data: invitesData } = useQuery({
    queryKey: ['servers', serverId, 'invites'],
    queryFn: () => {
      if (!serverId) {
        throw new Error('Server ID is required');
      }
      return api.getInvites(serverId);
    },
    enabled: isLoggedIn && !!serverId,
  });

  if (!invitesData) {
    return null;
  }

  return (
    <>
      <TopNav
        header={t('invites.headers.serverInvites')}
        subheader={t('navigation.subheaders.serverSettings')}
        subheaderAboveHeader
        onBackClick={() => navigate(`${serverPath}${NavigationPaths.Settings}`)}
      />

      <div className="flex h-full flex-col items-center justify-center gap-3.5 p-3 pt-4 md:p-16">
        <Card className="w-full max-w-md">
          <CardContent className="px-3 md:px-6">
            <InviteForm />
          </CardContent>
        </Card>

        {isDesktop ? (
          <InvitesTable invites={invitesData.invites} />
        ) : (
          invitesData.invites.map((invite) => (
            <InviteCard key={invite.id} invite={invite} />
          ))
        )}
      </div>
    </>
  );
};
