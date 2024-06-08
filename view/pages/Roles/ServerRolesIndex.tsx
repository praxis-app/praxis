import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import RoleList from '../../components/Roles/RoleList';
import ServerRoleForm from '../../components/Roles/ServerRoles/ServerRoleForm';
import Flex from '../../components/Shared/Flex';
import GhostButton from '../../components/Shared/GhostButton';
import LevelOneHeading from '../../components/Shared/LevelOneHeading';
import ProgressBar from '../../components/Shared/ProgressBar';
import { NavigationPaths } from '../../constants/shared.constants';
import { useServerRolesQuery } from '../../graphql/roles/queries/gen/ServerRoles.gen';
import { isDeniedAccess } from '../../utils/error.utils';

const ServerRolesIndex = () => {
  const { data, loading, error } = useServerRolesQuery();

  const roles = data?.serverRoles;
  const permissions = data?.me.serverPermissions;
  const canManageRoles = permissions?.manageRoles;

  const { t } = useTranslation();
  const navigate = useNavigate();

  if (isDeniedAccess(error) || (permissions && !canManageRoles)) {
    return <Typography>{t('prompts.permissionDenied')}</Typography>;
  }

  if (error) {
    return <Typography>{t('errors.somethingWentWrong')}</Typography>;
  }

  if (loading) {
    return <ProgressBar />;
  }

  return (
    <>
      <Flex justifyContent="space-between" alignItems="center">
        <LevelOneHeading header>
          {t('roles.headers.serverRoles')}
        </LevelOneHeading>

        <GhostButton
          onClick={() => navigate(NavigationPaths.ViewRoles)}
          sx={{ marginBottom: 3.5 }}
        >
          {t('roles.labels.quickView')}
        </GhostButton>
      </Flex>

      <ServerRoleForm />
      {roles && <RoleList roles={roles} />}
    </>
  );
};

export default ServerRolesIndex;
