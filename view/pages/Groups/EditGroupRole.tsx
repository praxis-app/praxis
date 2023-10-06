import { Typography } from '@mui/material';
import { truncate } from 'lodash';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useEditGroupRoleLazyQuery } from '../../apollo/groups/generated/EditGroupRole.query';
import EditRoleTabs from '../../components/Roles/EditRoleTabs';
import Breadcrumbs from '../../components/Shared/Breadcrumbs';
import ProgressBar from '../../components/Shared/ProgressBar';
import {
  NavigationPaths,
  TruncationSizes,
} from '../../constants/shared.constants';
import { useIsDesktop } from '../../hooks/shared.hooks';
import { isDeniedAccess } from '../../utils/error.utils';
import { getGroupPath } from '../../utils/group.utils';

const EditGroupRole = () => {
  const [getRole, { data, loading, error }] = useEditGroupRoleLazyQuery();

  const { id, name } = useParams();
  const { t } = useTranslation();
  const isDesktop = useIsDesktop();

  useEffect(() => {
    if (id) {
      getRole({ variables: { id: parseInt(id) } });
    }
  }, [getRole, id]);

  const role = data?.groupRole;
  const groupPath = getGroupPath(name || '');
  const groupRolesPath = `${groupPath}${NavigationPaths.Roles}`;
  const canManageRoles = role?.group?.myPermissions?.manageRoles;

  if (isDeniedAccess(error) || (role && !canManageRoles)) {
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

  const breadcrumbs = [
    {
      label: truncate(name, {
        length: isDesktop ? TruncationSizes.Small : TruncationSizes.ExtraSmall,
      }),
      href: groupPath,
    },
    {
      label: t('groups.labels.groupRoles'),
      href: groupRolesPath,
    },
    {
      label: role.name,
    },
  ];

  return (
    <>
      <Breadcrumbs breadcrumbs={breadcrumbs} />
      <EditRoleTabs role={role} />
    </>
  );
};

export default EditGroupRole;
