import { AuditLogFeed } from '@/components/audit-log/audit-log-feed';
import { TopNav } from '@/components/nav/top-nav';
import { PermissionDenied } from '@/components/shared/permission-denied';
import { Container } from '@/components/ui/container';
import { NavigationPaths } from '@/constants/shared.constants';
import { useAbility } from '@/hooks/use-ability';
import { useServerData } from '@/hooks/use-server-data';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export const ServerAuditLog = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { serverId, serverPath } = useServerData();
  const { serverAbility, instanceAbility, isLoading } = useAbility();
  const canView =
    serverAbility.can('read', 'AuditLog') ||
    instanceAbility.can('read', 'AuditLog');
  const topNavProps = {
    header: t('auditLog.headers.server'),
    subheader: t('navigation.subheaders.serverSettings'),
    subheaderAboveHeader: true,
    onBackClick: () => navigate(`${serverPath}${NavigationPaths.Settings}`),
  };

  if (!isLoading && !canView) {
    return <PermissionDenied topNavProps={topNavProps} />;
  }

  if (isLoading) {
    return null;
  }

  return (
    <>
      <TopNav {...topNavProps} />
      <Container>
        <AuditLogFeed scope="server" serverId={serverId} enabled={canView} />
      </Container>
    </>
  );
};
