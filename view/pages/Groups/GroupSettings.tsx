import { Typography } from '@mui/material';
import { truncate } from 'lodash';
import { useTranslation } from 'react-i18next';
import { useIsDesktop } from '../../hooks/shared.hooks';
import { useParams } from 'react-router-dom';
import { isDeniedAccess } from '../../utils/error.utils';
import ProgressBar from '../../components/Shared/ProgressBar';
import { TruncationSizes } from '../../constants/shared.constants';
import { getGroupPath } from '../../utils/group.utils';
import Breadcrumbs from '../../components/Shared/Breadcrumbs';
import GroupSettingsForm from '../../components/Groups/GroupSettingsForm';
import { useGroupSettingsLazyQuery } from '../../apollo/groups/generated/GroupSettings.query';
import { useEffect } from 'react';

const GroupSettings = () => {
  const [getGroup, { data, loading, error }] = useGroupSettingsLazyQuery();

  const { name } = useParams();
  const { t } = useTranslation();
  const isDesktop = useIsDesktop();

  const group = data?.group;
  const canManageSettings = group?.myPermissions?.manageSettings;

  useEffect(() => {
    if (name) {
      getGroup({ variables: { name } });
    }
  }, [name, getGroup]);

  if (isDeniedAccess(error) || (group && !canManageSettings)) {
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
        length: isDesktop ? TruncationSizes.Small : TruncationSizes.ExtraSmall,
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
