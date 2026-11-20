import { AuditLogFeed } from '@/components/audit-log/audit-log-feed';
import { TopNav } from '@/components/nav/top-nav';
import { PermissionDenied } from '@/components/shared/permission-denied';
import { Container } from '@/components/ui/container';
import { NavigationPaths } from '@/constants/shared.constants';
import { useAbility } from '@/hooks/use-ability';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export const InstanceAuditLog = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { instanceAbility, isLoading } = useAbility();
  const canView = instanceAbility.can('read', 'AuditLog');
  const topNavProps = {
    header: t('auditLog.headers.instance'),
    subheader: t('navigation.subheaders.instanceSettings'),
    subheaderAboveHeader: true,
    onBackClick: () => navigate(NavigationPaths.Settings),
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
        <AuditLogFeed scope="instance" enabled={canView} />
      </Container>
    </>
  );
};
