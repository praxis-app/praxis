import { Typography } from '@mui/material';
import { truncate } from 'lodash';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useEditGroupLazyQuery } from '../../apollo/groups/generated/EditGroup.query';
import GroupForm from '../../components/Groups/GroupForm';
import Breadcrumbs from '../../components/Shared/Breadcrumbs';
import ProgressBar from '../../components/Shared/ProgressBar';
import { TruncationSizes } from '../../constants/shared.constants';
import { useIsDesktop } from '../../hooks/shared.hooks';
import { getGroupPath } from '../../utils/group.utils';

const EditGroup = () => {
  const [getGroup, { data, loading, error }] = useEditGroupLazyQuery();
  const group = data?.group;

  const { name } = useParams();
  const { t } = useTranslation();
  const isDesktop = useIsDesktop();

  useEffect(() => {
    if (name) {
      getGroup({ variables: { name } });
    }
  }, [name, getGroup]);

  if (error) {
    return <Typography>{t('errors.somethingWentWrong')}</Typography>;
  }

  if (loading) {
    return <ProgressBar />;
  }

  if (!group) {
    return null;
  }

  if (!group.myPermissions?.updateGroup) {
    return <Typography>{t('prompts.permissionDenied')}</Typography>;
  }

  const breadcrumbs = [
    {
      label: truncate(name, {
        length: isDesktop ? TruncationSizes.Small : TruncationSizes.ExtraSmall,
      }),
      href: getGroupPath(name || ''),
    },
    {
      label: t('groups.actions.edit'),
    },
  ];

  return (
    <>
      <Breadcrumbs breadcrumbs={breadcrumbs} />
      <GroupForm editGroup={group} />
    </>
  );
};

export default EditGroup;
