import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { usePublicGroupsQuery } from '../../apollo/groups/generated/PublicGroups.query';
import GroupCard from '../../components/Groups/GroupCard';
import GroupTipsCard from '../../components/Groups/GroupTipsCard';
import ProgressBar from '../../components/Shared/ProgressBar';
import { isDeniedAccess } from '../../utils/error.utils';

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
