import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import ServerRoleView from '../../components/Roles/ServerRoles/ServerRoleView';
import LevelOneHeading from '../../components/Shared/LevelOneHeading';
import ProgressBar from '../../components/Shared/ProgressBar';
import { useViewServerRolesQuery } from '../../graphql/roles/queries/gen/ViewServerRoles.gen';

const ViewServerRoles = () => {
  const { data, loading, error } = useViewServerRolesQuery();

  const { t } = useTranslation();

  if (error) {
    return <Typography>{t('errors.somethingWentWrong')}</Typography>;
  }

  if (loading) {
    return <ProgressBar />;
  }

  if (!data) {
    return null;
  }

  const { serverRoles, me } = data;
  const { manageRoles } = me.serverPermissions;

  return (
    <>
      <LevelOneHeading header sx={{ marginBottom: 1 }}>
        {t('roles.headers.viewServerRoles')}
      </LevelOneHeading>

      <Typography color="text.secondary" marginBottom={3}>
        {t('roles.subheaders.viewServerRoles')}
      </Typography>

      {serverRoles.map((role) => (
        <ServerRoleView
          key={role.id}
          canManageRoles={manageRoles}
          role={role}
        />
      ))}
    </>
  );
};

export default ViewServerRoles;
