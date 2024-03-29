import { useReactiveVar } from '@apollo/client';
import { Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import GroupAboutTab from '../../components/Groups/GroupAboutTab';
import GroupEventsTab from '../../components/Groups/GroupEventsTab';
import GroupPageCard from '../../components/Groups/GroupPageCard';
import Feed from '../../components/Shared/Feed';
import ProgressBar from '../../components/Shared/ProgressBar';
import ToggleForms from '../../components/Shared/ToggleForms';
import { DEFAULT_PAGE_SIZE } from '../../constants/shared.constants';
import { isLoggedInVar, isVerifiedVar } from '../../graphql/cache';
import { useGroupFeedLazyQuery } from '../../graphql/groups/queries/gen/GroupFeed.gen';
import { useGroupPageLazyQuery } from '../../graphql/groups/queries/gen/GroupPage.gen';
import { isDeniedAccess } from '../../utils/error.utils';

const GroupPage = () => {
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PAGE_SIZE);
  const [page, setPage] = useState(0);
  const [tab, setTab] = useState(0);

  const isLoggedIn = useReactiveVar(isLoggedInVar);
  const isVerified = useReactiveVar(isVerifiedVar);

  const [
    getGroupProfile,
    { data: groupPageData, loading: groupPageLoading, error },
  ] = useGroupPageLazyQuery({
    errorPolicy: 'all',
  });

  const [getGroupFeed, { data: groupFeedData, loading: groupFeedLoading }] =
    useGroupFeedLazyQuery({
      errorPolicy: 'all',
    });

  const { name } = useParams();
  const { t } = useTranslation();

  useEffect(() => {
    if (name) {
      getGroupProfile({
        variables: { name, isVerified },
      });
    }
  }, [name, isVerified, getGroupProfile]);

  useEffect(() => {
    if (name) {
      getGroupFeed({
        variables: {
          limit: rowsPerPage,
          offset: page * rowsPerPage,
          isLoggedIn,
          isVerified,
          name,
        },
      });
    }
  }, [name, isLoggedIn, isVerified, getGroupFeed, page, rowsPerPage]);

  const handleChangePage = async (newPage: number) => {
    if (!name) {
      return;
    }
    await getGroupFeed({
      variables: {
        limit: rowsPerPage,
        offset: newPage * rowsPerPage,
        isLoggedIn,
        isVerified,
        name,
      },
    });
  };

  if (groupPageLoading) {
    return <ProgressBar />;
  }

  if (!groupPageData) {
    if (isDeniedAccess(error)) {
      return <Typography>{t('prompts.permissionDenied')}</Typography>;
    }

    if (error) {
      return <Typography>{t('errors.somethingWentWrong')}</Typography>;
    }
    return null;
  }

  const { group, me } = groupPageData;

  return (
    <>
      <GroupPageCard
        canRemoveGroups={me?.serverPermissions?.removeGroups}
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
            feedItems={groupFeedData?.group.feed}
            totalCount={groupFeedData?.group.feedCount}
            isLoading={groupFeedLoading}
            onChangePage={handleChangePage}
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

export default GroupPage;
