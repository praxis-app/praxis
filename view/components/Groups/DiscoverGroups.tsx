import { Card, CardContent, Tab, Tabs, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import GroupCard from './GroupCard';
import { GroupsPageTabs } from '../../constants/group.constants';
import {
  DEFAULT_PAGE_SIZE,
  NavigationPaths,
  TAB_QUERY_PARAM,
} from '../../constants/shared.constants';
import { useGroupsLazyQuery } from '../../graphql/groups/queries/gen/Groups.gen';
import { useJoinedGroupsFeedLazyQuery } from '../../graphql/groups/queries/gen/JoinedGroupsFeed.gen';
import { useIsDesktop } from '../../hooks/shared.hooks';
import { isDeniedAccess } from '../../utils/error.utils';
import Feed from '../Shared/Feed';
import Flex from '../Shared/Flex';
import GhostButton from '../Shared/GhostButton';
import LevelOneHeading from '../Shared/LevelOneHeading';
import Link from '../Shared/Link';
import Modal from '../Shared/Modal';
import Pagination from '../Shared/Pagination';
import GroupForm from './GroupForm';

const DiscoverGroups = () => {
  const [tab, setTab] = useState(0);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PAGE_SIZE);
  const [page, setPage] = useState(0);

  const [
    getGroups,
    { data: groupsData, loading: groupsLoading, error: groupsError },
  ] = useGroupsLazyQuery({
    errorPolicy: 'all',
  });

  const [
    getActivityFeed,
    {
      data: activityFeedData,
      loading: activityFeedLoading,
      error: activityFeedError,
    },
  ] = useJoinedGroupsFeedLazyQuery();

  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();

  const tabParam = searchParams.get('tab');
  const isJoinedTab = tabParam === GroupsPageTabs.Joined;
  const isAllGroupsTab = tabParam === GroupsPageTabs.AllGroups;

  const pathPrefix = `${NavigationPaths.Groups}${TAB_QUERY_PARAM}`;
  const allGroupsTab = `${pathPrefix}${GroupsPageTabs.AllGroups}`;
  const joinedTab = `${pathPrefix}${GroupsPageTabs.Joined}`;

  const tabsStyles = {
    '& .MuiTabs-centered': {
      gap: isDesktop ? '20px' : '10px',
    },
  };

  useEffect(() => {
    if (!tabParam) {
      setTab(0);
    }
    if (isAllGroupsTab) {
      setTab(1);
    }
    if (isJoinedTab) {
      setTab(2);
    }
    if (tabParam) {
      getGroups({
        variables: {
          input: {
            limit: rowsPerPage,
            offset: page * rowsPerPage,
            joinedGroups: isJoinedTab,
          },
        },
      });
      return;
    }
    getActivityFeed({
      variables: {
        limit: rowsPerPage,
        offset: page * rowsPerPage,
      },
    });
  }, [
    getActivityFeed,
    getGroups,
    isAllGroupsTab,
    isJoinedTab,
    page,
    rowsPerPage,
    tabParam,
  ]);

  const getCount = () => {
    if (isJoinedTab) {
      return groupsData?.joinedGroupsCount;
    }
    if (!tabParam) {
      return activityFeedData?.joinedGroupsFeedCount;
    }
    return groupsData?.groupsCount;
  };

  const onChangePage = async (newPage: number) => {
    await getGroups({
      variables: {
        input: {
          limit: rowsPerPage,
          offset: newPage * rowsPerPage,
          joinedGroups: isJoinedTab,
        },
      },
    });
  };

  const handleTabClick = (path: string) => {
    navigate(path);
    setPage(0);
  };

  if ((!groupsData && groupsError) || activityFeedError) {
    if (isDeniedAccess(groupsError || activityFeedError)) {
      return <Typography>{t('prompts.permissionDenied')}</Typography>;
    }
    return <Typography>{t('errors.somethingWentWrong')}</Typography>;
  }

  const renderActivityFeed = () => (
    <Feed
      feedItems={activityFeedData?.joinedGroupsFeed}
      totalCount={activityFeedData?.joinedGroupsFeedCount}
      isLoading={activityFeedLoading}
      onChangePage={onChangePage}
      page={page}
      rowsPerPage={rowsPerPage}
      setPage={setPage}
      setRowsPerPage={setRowsPerPage}
      showTopPagination={false}
      noContentMessage={
        <Typography textAlign="center">
          <Link
            href={allGroupsTab}
            sx={{ fontFamily: 'Inter Bold', marginRight: '0.5ch' }}
          >
            Join groups
          </Link>
          to populate your feed.
        </Typography>
      }
    />
  );

  const renderGroupsLists = () => (
    <Pagination
      count={getCount()}
      isLoading={groupsLoading}
      onChangePage={onChangePage}
      page={page}
      rowsPerPage={rowsPerPage}
      setPage={setPage}
      setRowsPerPage={setRowsPerPage}
      showTopPagination={false}
    >
      {isAllGroupsTab && groupsData?.groupsCount === 0 && (
        <Card>
          <CardContent sx={{ '&:last-child': { paddingY: 5 } }}>
            <Typography textAlign="center">
              {t('groups.prompts.noGroups')}
            </Typography>
          </CardContent>
        </Card>
      )}

      {isJoinedTab && groupsData?.joinedGroupsCount === 0 && (
        <Card>
          <CardContent
            sx={{
              '&:last-child': { paddingY: 4 },
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Typography alignSelf="center" paddingBottom={2.5}>
              {t('groups.prompts.noJoinedGroups')}
            </Typography>
            <GhostButton
              onClick={() => navigate(allGroupsTab)}
              sx={{ alignSelf: 'center' }}
            >
              {t('groups.actions.seeAllGroups')}
            </GhostButton>
          </CardContent>
        </Card>
      )}

      {tabParam &&
        groupsData?.groups.map((group) => (
          <GroupCard
            key={group.id}
            canRemoveGroups={groupsData.me.serverPermissions.removeGroups}
            currentUserId={groupsData.me.id}
            group={group}
          />
        ))}
    </Pagination>
  );

  return (
    <>
      <Flex justifyContent="space-between" alignItems="center">
        <LevelOneHeading header>
          {isDesktop
            ? t('groups.headers.discoverGroups')
            : t('groups.headers.findGroups')}
        </LevelOneHeading>

        <GhostButton
          onClick={() => setIsCreateModalOpen((prev) => !prev)}
          sx={{ marginBottom: 3.5 }}
        >
          {isDesktop ? t('groups.actions.create') : t('actions.create')}
        </GhostButton>
      </Flex>

      <Card>
        <Tabs sx={tabsStyles} textColor="inherit" value={tab} centered>
          <Tab
            label={t('groups.tabs.activity')}
            onClick={() => handleTabClick(NavigationPaths.Groups)}
          />
          <Tab
            label={t('groups.tabs.allGroups')}
            onClick={() => handleTabClick(allGroupsTab)}
          />
          <Tab
            label={t('groups.tabs.joined')}
            onClick={() => handleTabClick(joinedTab)}
          />
        </Tabs>
      </Card>

      <Modal
        title={t('groups.actions.create')}
        topGap={isDesktop ? undefined : '150px'}
        contentStyles={{ minHeight: '150px' }}
        onClose={() => setIsCreateModalOpen(false)}
        open={isCreateModalOpen}
        centeredTitle
      >
        <GroupForm inModal />
      </Modal>

      {tabParam ? renderGroupsLists() : renderActivityFeed()}
    </>
  );
};

export default DiscoverGroups;
