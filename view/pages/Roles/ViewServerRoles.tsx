import { useReactiveVar } from '@apollo/client';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import ServerRoleView from '../../components/Roles/ServerRoles/ServerRoleView';
import LevelOneHeading from '../../components/Shared/LevelOneHeading';
import ProgressBar from '../../components/Shared/ProgressBar';
import { isVerifiedVar } from '../../graphql/cache';
import { useViewServerRolesQuery } from '../../graphql/roles/queries/gen/ViewServerRoles.gen';

const ViewServerRoles = () => {
  const isVerified = useReactiveVar(isVerifiedVar);
  const { data, loading, error } = useViewServerRolesQuery({
    skip: !isVerified,
  });

  const { t } = useTranslation();

  if (loading) {
    return <ProgressBar />;
  }

  if (!data) {
    if (!isVerified) {
      return <Typography>{t('prompts.permissionDenied')}</Typography>;
    }
    if (error) {
      return <Typography>{t('errors.somethingWentWrong')}</Typography>;
    }
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
