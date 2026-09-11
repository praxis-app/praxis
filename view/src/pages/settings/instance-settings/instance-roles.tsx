import { api } from '@/client/api-client';
import { TopNav } from '@/components/nav/top-nav';
import { InstanceRole } from '@/components/roles/instance-roles/instance-role';
import { InstanceRoleForm } from '@/components/roles/instance-roles/instance-role-form';
import { PermissionDenied } from '@/components/shared/permission-denied';
import { Card, CardContent } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { NavigationPaths } from '@/constants/shared.constants';
import { useAbility } from '@/hooks/use-ability';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export const InstanceRoles = () => {
  const { data, isPending, error } = useQuery({
    queryKey: ['instance-roles'],
    queryFn: () => api.getInstanceRoles(),
  });

  const { instanceAbility, isLoading: isAbilityLoading } = useAbility();
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (isAbilityLoading || isPending) {
    return null;
  }

  if (!instanceAbility.can('manage', 'InstanceRole')) {
    return (
      <PermissionDenied
        topNavProps={{
          header: t('navigation.labels.roles'),
          subheader: t('navigation.subheaders.instanceSettings'),
          subheaderAboveHeader: true,
          onBackClick: () => navigate(NavigationPaths.Settings),
        }}
      />
    );
  }

  return (
    <>
      <TopNav
        header={t('navigation.labels.roles')}
        subheader={t('navigation.subheaders.instanceSettings')}
        subheaderAboveHeader
        onBackClick={() => navigate(NavigationPaths.Settings)}
      />
      <Container>
        <InstanceRoleForm />

        {data && (
          <Card className="py-3">
            <CardContent className="flex flex-col gap-2 px-3">
              {data.instanceRoles.map((role) => (
                <InstanceRole key={role.id} instanceRole={role} />
              ))}
            </CardContent>
          </Card>
        )}

        {error && <p>{t('errors.somethingWentWrong')}</p>}
      </Container>
    </>
  );
};
