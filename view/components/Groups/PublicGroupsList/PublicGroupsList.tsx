import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { isDeniedAccess } from '../../../utils/error.utils';
import ProgressBar from '../../Shared/ProgressBar';
import GroupCard from '../GroupCard/GroupCard';
import GroupTipsCard from '../GroupTipsCard';
import { usePublicGroupsQuery } from './generated/PublicGroups.query';

const PublicGroupsList = () => {
  const { data, loading, error } = usePublicGroupsQuery({
    errorPolicy: 'all',
  });

  const { t } = useTranslation();

  if (loading) {
    return <ProgressBar />;
  }

  if (!data) {
    if (isDeniedAccess(error)) {
      return <Typography>{t('prompts.permissionDenied')}</Typography>;
    }
    if (error) {
      return <Typography>{t('errors.somethingWentWrong')}</Typography>;
    }
    return null;
  }

  return (
    <>
      <GroupTipsCard />

      {data.publicGroups.map((group) => (
        <GroupCard group={group} key={group.id} />
      ))}
    </>
  );
};

export default PublicGroupsList;
