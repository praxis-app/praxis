import { Card, Tab, Tabs, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { GroupsPageTabs } from '../../constants/group.constants';
import {
  DEFAULT_PAGE_SIZE,
  NavigationPaths,
  TAB_QUERY_PARAM,
} from '../../constants/shared.constants';
import { HomeFeedType } from '../../graphql/gen';
import { useHomeFeedLazyQuery } from '../../graphql/users/queries/gen/HomeFeed.gen';
import { isDeniedAccess } from '../../utils/error.utils';
import Feed from '../Shared/Feed';
import Link from '../Shared/Link';

enum HomeFeedTabs {
  YourFeed = 'your-feed',
  Proposals = 'proposals',
  Following = 'following',
}

const HomeFeed = () => {
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PAGE_SIZE);
  const [page, setPage] = useState(0);
  const [tab, setTab] = useState(0);

  const [getHomeFeed, { data, loading, error }] = useHomeFeedLazyQuery();

  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const groupsPathPrefix = `${NavigationPaths.Groups}${TAB_QUERY_PARAM}`;
  const allGroupsTab = `${groupsPathPrefix}${GroupsPageTabs.AllGroups}`;

  const homePathPrefix = `${NavigationPaths.Home}${TAB_QUERY_PARAM}`;
  const followingTab = `${homePathPrefix}${HomeFeedTabs.Following}`;
  const proposalsTab = `${homePathPrefix}${HomeFeedTabs.Proposals}`;
  const tabParam = searchParams.get('tab');

  useEffect(() => {
    let feedType: HomeFeedType = 'YOUR_FEED';

    if (!tabParam) {
      setTab(0);
    }
    if (tabParam === HomeFeedTabs.Proposals) {
      feedType = 'PROPOSALS';
      setTab(1);
    }
    if (tabParam === HomeFeedTabs.Following) {
      feedType = 'FOLLOWING';
      setTab(2);
    }
    getHomeFeed({
      variables: {
        input: {
          limit: DEFAULT_PAGE_SIZE,
          offset: 0,
          feedType,
        },
      },
    });
  }, [getHomeFeed, tabParam]);

  const getFeedType = (): HomeFeedType => {
    switch (tab) {
      case 1:
        return 'PROPOSALS';
      case 2:
        return 'FOLLOWING';
      default:
        return 'YOUR_FEED';
    }
  };

  const handleChangePage = async (newPage: number) => {
    await getHomeFeed({
      variables: {
        input: {
          limit: rowsPerPage,
          offset: newPage * rowsPerPage,
          feedType: getFeedType(),
        },
      },
    });
  };

  const handleTabClick = (path: string) => {
    setPage(0);
    navigate(path);
  };

  if (isDeniedAccess(error)) {
    return <Typography>{t('prompts.permissionDenied')}</Typography>;
  }
  if (error) {
    return <Typography>{t('errors.somethingWentWrong')}</Typography>;
  }

  return (
    <>
      <Feed
        feedItems={data?.me.homeFeed.nodes}
        isLoading={loading}
        onChangePage={handleChangePage}
        page={page}
        rowsPerPage={rowsPerPage}
        setPage={setPage}
        setRowsPerPage={setRowsPerPage}
        totalCount={data?.me.homeFeed.totalCount}
        tabs={
          <Card>
            <Tabs textColor="inherit" value={tab} centered>
              <Tab
                label={t('users.labels.yourFeed')}
                onClick={() => handleTabClick(NavigationPaths.Home)}
              />
              <Tab
                label={t('groups.tabs.proposals')}
                onClick={() => handleTabClick(proposalsTab)}
              />
              <Tab
                label={t('users.profile.following')}
                onClick={() => handleTabClick(followingTab)}
              />
            </Tabs>
          </Card>
        }
        noContentMessage={
          <>
            <Typography variant="body1" textAlign="center">
              {`${t('users.prompts.readyToExplore')} `}
              <Link
                href={allGroupsTab}
                sx={{ fontFamily: 'Inter Bold', marginRight: '0.5ch' }}
              >
                Join groups
              </Link>
              to populate your feed.
            </Typography>
          </>
        }
      />
    </>
  );
};

export default HomeFeed;
