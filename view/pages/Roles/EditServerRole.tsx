// TODO: Determine whether RoleForm and PermissionsForm should be combined

import { Typography } from '@mui/material';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useEditServerRoleLazyQuery } from '../../apollo/roles/generated/EditServerRole.query';
import EditRoleTabs from '../../components/Roles/EditRoleTabs';
import Breadcrumbs from '../../components/Shared/Breadcrumbs';
import ProgressBar from '../../components/Shared/ProgressBar';
import { NavigationPaths } from '../../constants/shared.constants';
import { isDeniedAccess } from '../../utils/error.utils';

const EditServerRole = () => {
  const [getServerRole, { data, loading, error }] =
    useEditServerRoleLazyQuery();

  const { id } = useParams();
  const { t } = useTranslation();

  useEffect(() => {
    if (id) {
      getServerRole({
        variables: { id: parseInt(id) },
      });
    }
  }, [id, getServerRole]);

  const me = data?.me;
  const role = data?.serverRole;

  if (isDeniedAccess(error) || (me && !me.serverPermissions.manageRoles)) {
    return <Typography>{t('prompts.permissionDenied')}</Typography>;
  }

  if (error) {
    return <Typography>{t('errors.somethingWentWrong')}</Typography>;
  }
  if (loading) {
    return <ProgressBar />;
  }
  if (!role) {
    return null;
  }

  return (
    <>
      <Breadcrumbs
        breadcrumbs={[
          {
            label: t('roles.headers.serverRoles'),
            href: NavigationPaths.Roles,
          },
          {
            label: role.name,
          },
        ]}
      />

      <EditRoleTabs role={role} />
    </>
  );
};

export default EditServerRole;
