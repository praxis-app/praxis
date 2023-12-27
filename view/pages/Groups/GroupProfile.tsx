import { useReactiveVar } from '@apollo/client';
import { Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import GroupAboutTab from '../../components/Groups/GroupAboutTab';
import GroupEventsTab from '../../components/Groups/GroupEventsTab';
import GroupProfileCard from '../../components/Groups/GroupProfileCard';
import Feed from '../../components/Shared/Feed';
import ProgressBar from '../../components/Shared/ProgressBar';
import ToggleForms from '../../components/Shared/ToggleForms';
import { isLoggedInVar } from '../../graphql/cache';
import { useGroupProfileLazyQuery } from '../../graphql/groups/queries/gen/GroupProfile.gen';
import { isDeniedAccess } from '../../utils/error.utils';
import { DEFAULT_PAGE_SIZE } from '../../constants/shared.constants';

const GroupProfile = () => {
  const isLoggedIn = useReactiveVar(isLoggedInVar);
  const [tab, setTab] = useState(0);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PAGE_SIZE);

  const [getGroup, { data, loading, error }] = useGroupProfileLazyQuery({
    errorPolicy: 'all',
  });

  const { name } = useParams();
  const { t } = useTranslation();

  useEffect(() => {
    if (name) {
      getGroup({
        variables: { name, isLoggedIn },
      });
    }
  }, [name, isLoggedIn, getGroup]);

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

  const { group, me } = data;

  return (
    <>
      <GroupProfileCard
        currentUserId={me?.id}
        group={group}
        setTab={setTab}
        tab={tab}
      />

      {tab === 0 && (
        <>
          {me && group.isJoinedByMe && (
            <ToggleForms groupId={group.id} me={me} />
          )}
          <Feed
            feed={group.feed}
            page={page}
            rowsPerPage={rowsPerPage}
            setPage={setPage}
            setRowsPerPage={setRowsPerPage}
          />
        </>
      )}

      {tab === 1 && <GroupEventsTab groupId={group.id} />}

      {tab === 2 && <GroupAboutTab groupId={group.id} />}
    </>
  );
};

export default GroupProfile;
