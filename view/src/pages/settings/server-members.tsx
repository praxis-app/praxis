import { api } from '@/client/api-client';
import { TopNav } from '@/components/nav/top-nav';
import { ManagedServerMember } from '@/components/server-members/managed-server-member';
import { ServerBan } from '@/components/server-members/server-ban';
import { PermissionDenied } from '@/components/shared/permission-denied';
import { Card, CardContent } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { NavigationPaths } from '@/constants/shared.constants';
import { useAbility } from '@/hooks/use-ability';
import { useMeQuery } from '@/hooks/use-me-query';
import { useServerData } from '@/hooks/use-server-data';
import { getSettingsAccess } from '@/lib/role.utils';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export const ServerMembers = () => {
  const { serverId, serverPath } = useServerData();
  const { serverAbility, instanceAbility, isLoading } = useAbility();
  const { data: meData } = useMeQuery();

  const { t } = useTranslation();
  const navigate = useNavigate();

  const { canManageServerMembers } = getSettingsAccess(
    serverAbility,
    instanceAbility,
  );
  const serverSettingsPath = `${serverPath}${NavigationPaths.Settings}`;

  const { data: membersData, error: membersError } = useQuery({
    queryKey: ['servers', serverId, 'members'],
    queryFn: () => {
      if (!serverId) {
        throw new Error('Server ID is required');
      }
      return api.getServerMembers(serverId);
    },
    enabled: !!serverId && canManageServerMembers,
  });

  const { data: bansData, error: bansError } = useQuery({
    queryKey: ['servers', serverId, 'bans'],
    queryFn: () => {
      if (!serverId) {
        throw new Error('Server ID is required');
      }
      return api.getServerBans(serverId);
    },
    enabled: !!serverId && canManageServerMembers,
  });

  const topNavProps = {
    header: t('servers.headers.members'),
    subheader: t('navigation.subheaders.serverSettings'),
    subheaderAboveHeader: true,
    onBackClick: () => navigate(serverSettingsPath),
  };

  if (!isLoading && !canManageServerMembers) {
    return <PermissionDenied topNavProps={topNavProps} />;
  }

  if (!serverId || !membersData || !bansData) {
    return null;
  }

  return (
    <>
      <TopNav {...topNavProps} />
      <Container className="flex flex-col gap-6">
        <section aria-labelledby="server-members-heading">
          <h2 id="server-members-heading" className="mb-3 font-semibold">
            {t('servers.labels.membersCount', {
              count: membersData.users.length,
            })}
          </h2>
          <Card className="py-4">
            <CardContent className="flex flex-col gap-4 px-4">
              {membersData.users.map((member) => (
                <ManagedServerMember
                  key={member.id}
                  serverId={serverId}
                  member={member}
                  canModerate={member.id !== meData?.user.id}
                />
              ))}
            </CardContent>
          </Card>
        </section>

        <section aria-labelledby="server-bans-heading">
          <h2 id="server-bans-heading" className="mb-3 font-semibold">
            {t('servers.labels.bannedUsers')}
          </h2>
          <Card className="py-4">
            <CardContent className="flex flex-col gap-4 px-4">
              {bansData.bans.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  {t('servers.prompts.noBans')}
                </p>
              ) : (
                bansData.bans.map((ban) => (
                  <ServerBan key={ban.user.id} serverId={serverId} ban={ban} />
                ))
              )}
            </CardContent>
          </Card>
        </section>

        {(membersError || bansError) && <p>{t('errors.somethingWentWrong')}</p>}
      </Container>
    </>
  );
};
