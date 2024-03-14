import { Card, CardContent, Tab, Tabs, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import GroupCard from '../../components/Groups/GroupCard';
import {
  DEFAULT_PAGE_SIZE,
  NavigationPaths,
  TAB_QUERY_PARAM,
} from '../../constants/shared.constants';
import { useGroupsLazyQuery } from '../../graphql/groups/queries/gen/Groups.gen';
import { useIsDesktop } from '../../hooks/shared.hooks';
import { isDeniedAccess } from '../../utils/error.utils';
import Flex from '../Shared/Flex';
import GhostButton from '../Shared/GhostButton';
import LevelOneHeading from '../Shared/LevelOneHeading';
import Pagination from '../Shared/Pagination';
import GroupForm from './GroupForm';

enum GroupsPageTabs {
  Activity = 'activity',
  AllGroups = 'all-groups',
  Joined = 'joined',
}

const GroupsList = () => {
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PAGE_SIZE);
  const [page, setPage] = useState(0);
  const [tab, setTab] = useState(0);

  const [getGroups, { data, loading, error }] = useGroupsLazyQuery({
    errorPolicy: 'all',
  });

  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();

  const tabParam = searchParams.get('tab');

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
    if (tabParam === GroupsPageTabs.AllGroups) {
      setTab(1);
    }
    if (tabParam === GroupsPageTabs.Joined) {
      setTab(2);
    }

    getGroups({
      variables: {
        input: {
          limit: rowsPerPage,
          offset: page * rowsPerPage,
        },
      },
    });
  }, [rowsPerPage, page, getGroups, tabParam]);

  const onChangePage = async (newPage: number) => {
    await getGroups({
      variables: {
        input: {
          limit: rowsPerPage,
          offset: newPage * rowsPerPage,
        },
      },
    });
  };

  if (!data && error) {
    if (isDeniedAccess(error)) {
      return <Typography>{t('prompts.permissionDenied')}</Typography>;
    }
    return <Typography>{t('errors.somethingWentWrong')}</Typography>;
  }

  return (
    <>
      <Flex justifyContent="space-between" alignItems="center">
        <LevelOneHeading header>
          {isDesktop
            ? t('groups.headers.exploreGroups')
            : t('groups.headers.findGroups')}
        </LevelOneHeading>

        <GhostButton sx={{ marginBottom: 3.5 }}>
          {isDesktop ? t('groups.actions.create') : t('actions.create')}
        </GhostButton>
      </Flex>

      <Card>
        <Tabs sx={tabsStyles} textColor="inherit" value={tab} centered>
          <Tab
            label={t('groups.tabs.activity')}
            onClick={() => navigate(NavigationPaths.Groups)}
          />
          <Tab
            label={t('groups.tabs.allGroups')}
            onClick={() => navigate(allGroupsTab)}
          />
          <Tab
            label={t('groups.tabs.joined')}
            onClick={() => navigate(joinedTab)}
          />
        </Tabs>
      </Card>

      <GroupForm />

      <Pagination
        count={data?.groupsCount}
        isLoading={loading}
        onChangePage={onChangePage}
        page={page}
        rowsPerPage={rowsPerPage}
        setPage={setPage}
        setRowsPerPage={setRowsPerPage}
      >
        {data?.groupsCount === 0 && (
          <Card>
            <CardContent sx={{ '&:last-child': { paddingY: 5 } }}>
              <Typography textAlign="center">
                {t('groups.prompts.noGroups')}
              </Typography>
            </CardContent>
          </Card>
        )}

        {data?.groups.map((group) => (
          <GroupCard
            key={group.id}
            canRemoveGroups={data.me.serverPermissions.removeGroups}
            currentUserId={data.me.id}
            group={group}
          />
        ))}
      </Pagination>
    </>
  );
};

export default GroupsList;
