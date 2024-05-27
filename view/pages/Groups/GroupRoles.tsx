import { Typography } from '@mui/material';
import { truncate } from 'lodash';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import GroupRoleForm from '../../components/Groups/GroupRoles/GroupRoleForm';
import RoleList from '../../components/Roles/RoleList';
import Breadcrumbs from '../../components/Shared/Breadcrumbs';
import ProgressBar from '../../components/Shared/ProgressBar';
import { GroupAdminModel } from '../../constants/group.constants';
import { TruncationSizes } from '../../constants/shared.constants';
import { useGroupRolesLazyQuery } from '../../graphql/groups/queries/gen/GroupRoles.gen';
import { useIsDesktop } from '../../hooks/shared.hooks';
import { isDeniedAccess } from '../../utils/error.utils';
import { getGroupPath } from '../../utils/group.utils';

const GroupRoles = () => {
  const [getGroupRoles, { data, loading, error }] = useGroupRolesLazyQuery();

  const { name } = useParams();
  const { t } = useTranslation();
  const isDesktop = useIsDesktop();

  const group = data?.group;
  const roles = group?.roles;
  const isNoAdmin = group?.settings.adminModel === GroupAdminModel.NoAdmin;

  useEffect(() => {
    if (name) {
      getGroupRoles({ variables: { name } });
    }
  }, [name, getGroupRoles]);

  if (
    isDeniedAccess(error) ||
    (group && !group.myPermissions.manageRoles) ||
    isNoAdmin
  ) {
    return <Typography>{t('prompts.permissionDenied')}</Typography>;
  }

  if (error) {
    return <Typography>{t('errors.somethingWentWrong')}</Typography>;
  }

  if (loading) {
    return <ProgressBar />;
  }

  const breadcrumbs = [
    {
      label: truncate(name, {
        length: isDesktop ? TruncationSizes.Medium : TruncationSizes.Small,
      }),
      href: getGroupPath(name || ''),
    },
    {
      label: t('groups.labels.groupRoles'),
    },
  ];

  return (
    <>
      <Breadcrumbs breadcrumbs={breadcrumbs} />
      {group && <GroupRoleForm groupId={group.id} />}
      {roles && <RoleList roles={roles} />}
    </>
  );
};

export default GroupRoles;
