import { Typography } from '@mui/material';
import { truncate } from 'lodash';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import GroupSettingsForm from '../../components/Groups/GroupSettingsForm';
import Breadcrumbs from '../../components/Shared/Breadcrumbs';
import ProgressBar from '../../components/Shared/ProgressBar';
import { GroupAdminModel } from '../../constants/group.constants';
import { TruncationSizes } from '../../constants/shared.constants';
import { useGroupSettingsLazyQuery } from '../../graphql/groups/queries/gen/GroupSettings.gen';
import { useIsDesktop } from '../../hooks/shared.hooks';
import { isDeniedAccess } from '../../utils/error.utils';
import { getGroupPath } from '../../utils/group.utils';

const GroupSettings = () => {
  const [getGroup, { data, loading, error }] = useGroupSettingsLazyQuery();

  const { name } = useParams();
  const { t } = useTranslation();
  const isDesktop = useIsDesktop();

  const group = data?.group;
  const canManageSettings = group?.myPermissions?.manageSettings;
  const isNoAdmin = group?.settings.adminModel === GroupAdminModel.NoAdmin;

  useEffect(() => {
    if (name) {
      getGroup({ variables: { name } });
    }
  }, [name, getGroup]);

  if (isDeniedAccess(error) || (group && !canManageSettings) || isNoAdmin) {
    return <Typography>{t('prompts.permissionDenied')}</Typography>;
  }
  if (error) {
    return <Typography>{t('errors.somethingWentWrong')}</Typography>;
  }
  if (loading) {
    return <ProgressBar />;
  }
  if (!group) {
    return null;
  }

  const breadcrumbs = [
    {
      label: truncate(name, {
        length: isDesktop ? TruncationSizes.Medium : TruncationSizes.Small,
      }),
      href: getGroupPath(name || ''),
    },
    {
      label: t('groups.labels.groupSettings'),
    },
  ];

  return (
    <>
      <Breadcrumbs breadcrumbs={breadcrumbs} sx={{ marginBottom: 3 }} />
      <GroupSettingsForm group={group} />
    </>
  );
};

export default GroupSettings;
