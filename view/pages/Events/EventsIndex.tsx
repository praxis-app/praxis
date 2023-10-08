import { useReactiveVar } from '@apollo/client';
import {
  Card,
  CardContent as MuiCardContent,
  styled,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { isLoggedInVar } from '../../apollo/cache';
import { useEventsLazyQuery } from '../../apollo/events/generated/Events.query';
import { EventsInput } from '../../apollo/gen';
import EventCompact from '../../components/Events/EventCompact';
import LevelOneHeading from '../../components/Shared/LevelOneHeading';
import ProgressBar from '../../components/Shared/ProgressBar';
import {
  NavigationPaths,
  TAB_QUERY_PARAM,
} from '../../constants/shared.constants';

enum EventTabs {
  Past = 'past',
  Future = 'future',
  ThisWeek = 'this-week',
  Online = 'online',
}

const CardContent = styled(MuiCardContent)(() => ({
  '&:last-child': {
    paddingBottom: 16,
  },
}));

const EventsIndex = () => {
  const isLoggedIn = useReactiveVar(isLoggedInVar);
  const [tab, setTab] = useState(0);

  const [getEvents, { data: data, loading: loading, error }] =
    useEventsLazyQuery();

  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const tabParam = searchParams.get('tab');

  useEffect(() => {
    let input: EventsInput = {};

    if (!tabParam) {
      input = { timeFrame: EventTabs.Future };
    }
    if (tabParam === EventTabs.ThisWeek) {
      input = { timeFrame: EventTabs.ThisWeek };
      setTab(1);
    }
    if (tabParam === EventTabs.Online) {
      input = { timeFrame: EventTabs.Future, online: true };
      setTab(2);
    }
    if (tabParam === EventTabs.Past) {
      input = { timeFrame: EventTabs.Past };
      setTab(3);
    }
    getEvents({
      variables: { input, isLoggedIn },
    });
  }, [tabParam, setTab, getEvents, isLoggedIn]);

  const events = data?.events || [];
  const pathPrefix = `${NavigationPaths.Events}${TAB_QUERY_PARAM}`;
  const thisWeekTabPath = `${pathPrefix}${EventTabs.ThisWeek}`;
  const onlineTabPath = `${pathPrefix}${EventTabs.Online}`;
  const pastTabPath = `${pathPrefix}${EventTabs.Past}`;

  const handleTabChange = async (_: any, value: number) => setTab(value);

  return (
    <>
      <LevelOneHeading header>
        {t('events.headers.discoverEvents')}
      </LevelOneHeading>

      <Card>
        <Tabs textColor="inherit" value={tab} onChange={handleTabChange}>
          <Tab
            label={t('events.labels.upcoming')}
            onClick={() => navigate(NavigationPaths.Events)}
          />
          <Tab
            label={t('events.labels.thisWeek')}
            onClick={() => navigate(thisWeekTabPath)}
          />
          <Tab
            label={t('events.labels.online')}
            onClick={() => navigate(onlineTabPath)}
          />
          <Tab
            label={t('events.labels.past')}
            onClick={() => navigate(pastTabPath)}
          />
        </Tabs>
      </Card>

      {error && <Typography>{t('errors.somethingWentWrong')}</Typography>}
      {loading && <ProgressBar />}

      {!!events.length && (
        <Card>
          <CardContent>
            {events.map((event, index) => (
              <EventCompact
                key={event.id}
                event={event}
                isLast={index + 1 === events.length}
              />
            ))}
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default EventsIndex;
