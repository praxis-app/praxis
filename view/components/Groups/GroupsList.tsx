import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useGroupsQuery } from '../../apollo/groups/generated/Groups.query';
import GroupCard from '../../components/Groups/GroupCard';
import ProgressBar from '../../components/Shared/ProgressBar';
import { isDeniedAccess } from '../../utils/error.utils';
import LevelOneHeading from '../Shared/LevelOneHeading';
import GroupForm from './GroupForm';

const GroupsList = () => {
  const { data, loading, error } = useGroupsQuery({
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

  const { groups, me } = data;

  return (
    <>
      <LevelOneHeading header>
        {t('groups.headers.discoverGroups')}
      </LevelOneHeading>

      <GroupForm />

      {groups.map((group) => (
        <GroupCard group={group} currentUserId={me?.id} key={group.id} />
      ))}
    </>
  );
};

export default GroupsList;
