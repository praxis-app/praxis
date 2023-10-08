import { useReactiveVar } from '@apollo/client';
import {
  Flag,
  Group,
  Language,
  Person,
  Place,
  Timer,
} from '@mui/icons-material';
import {
  Card,
  CardProps,
  Divider,
  CardContent as MuiCardContent,
  SxProps,
  Tab,
  Tabs,
  Typography,
  styled,
} from '@mui/material';
import dayjs from 'dayjs';
import humanizeDuration from 'humanize-duration';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { isLoggedInVar, toastVar } from '../../apollo/cache';
import { useDeleteEventMutation } from '../../apollo/events/generated/DeleteEvent.mutation';
import { EventPageCardFragment } from '../../apollo/events/generated/EventPageCard.fragment';
import {
  MIDDOT_WITH_SPACES,
  NavigationPaths,
  TAB_QUERY_PARAM,
} from '../../constants/shared.constants';
import { useAboveBreakpoint } from '../../hooks/shared.hooks';
import { getEventPath } from '../../utils/event.utils';
import { getGroupEventsTabPath } from '../../utils/group.utils';
import { formatDateTime } from '../../utils/time.utils';
import { getUserProfilePath } from '../../utils/user.utils';
import CoverPhoto from '../Images/CoverPhoto';
import ExternalLink from '../Shared/ExternalLink';
import ItemMenu from '../Shared/ItemMenu';
import Link from '../Shared/Link';
import EventAttendeeButtons from './EventAttendeeButtons';

enum EventPageTabs {
  About = 'about',
  Discussion = 'discussion',
}

const NameText = styled(Typography)(() => ({
  fontFamily: 'Inter Bold',
  marginBottom: 7.5,
}));
const CardContent = styled(MuiCardContent)(() => ({
  paddingTop: 14,
  '&:last-child': {
    paddingBottom: 16,
  },
}));

interface Props extends CardProps {
  event: EventPageCardFragment;
  canManageAllEvents: boolean;
  setIsDeleting(isDeleting: boolean): void;
  setTab(tab: number): void;
  tab: number;
}

const EventPageCard = ({
  event,
  canManageAllEvents,
  setIsDeleting,
  setTab,
  tab,
}: Props) => {
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const isLoggedIn = useReactiveVar(isLoggedInVar);
  const [deleteEvent] = useDeleteEventMutation();

  const { t } = useTranslation();
  const isAboveMedium = useAboveBreakpoint('md');
  const isAboveSmall = useAboveBreakpoint('sm');
  const navigate = useNavigate();
  const params = useParams();

  useEffect(() => {
    if (!params.tab) {
      return;
    }
    if (params.tab === EventPageTabs.Discussion) {
      setTab(1);
    }
  }, [params.tab, setTab]);

  const {
    id,
    name,
    coverPhoto,
    endsAt,
    startsAt,
    online,
    externalLink,
    interestedCount,
    goingCount,
    group,
    host,
    location,
  } = event;

  const canManageGroupEvents = group?.myPermissions?.manageEvents;
  const canManageEvents = canManageAllEvents || canManageGroupEvents;

  const eventPagePath = getEventPath(id);
  const editEventPath = `${eventPagePath}/edit`;
  const groupEventsTabPath = getGroupEventsTabPath(group?.name || '');
  const discussionTabPath = `${eventPagePath}${TAB_QUERY_PARAM}${EventPageTabs.Discussion}`;
  const hostPath = getUserProfilePath(host.name);

  const startsAtFormatted = formatDateTime(startsAt);
  const endsAtFormatted = dayjs(endsAt).format(' [-] h:mm a');
  const startsAtWithEndsAt = `${startsAtFormatted}${endsAtFormatted}`;
  const isSameDay = endsAt && dayjs(startsAt).isSame(endsAt, 'day');

  const difference = dayjs(endsAt).diff(startsAt);
  const duration = humanizeDuration(difference)
    .replace(/,/g, '')
    .replace(/hours|hour/g, t('time.hr'))
    .replace(/minutes|minute/g, t('time.min'));

  const deletePrompt = t('prompts.deleteItem', {
    itemType: 'event',
  });

  const iconStyles: SxProps = {
    fontSize: 20,
    marginBottom: '-0.3ch',
    marginRight: '0.8ch',
  };
  const itemMenuButtonStyles: SxProps = {
    borderRadius: 2,
    minWidth: 45,
    maxWidth: 45,
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    await deleteEvent({
      variables: { id },
      update(cache) {
        const cacheId = cache.identify(event);
        cache.evict({ id: cacheId });
        cache.gc();
      },
      onCompleted() {
        if (group) {
          navigate(groupEventsTabPath);
          return;
        }
        navigate(NavigationPaths.Events);
      },
      onError(err) {
        toastVar({
          status: 'error',
          title: err.message,
        });
      },
    });
  };

  const getNameTextWidth = () => {
    if (isAboveMedium) {
      return '75%';
    }
    if (isAboveSmall) {
      return '70%';
    }
    return '100%';
  };

  return (
    <Card>
      <CoverPhoto imageId={coverPhoto?.id} />
      <CardContent>
        <Typography
          color="#dd3f4f"
          fontSize="14px"
          lineHeight={1}
          variant="overline"
          fontFamily="Inter Bold"
        >
          {isSameDay ? startsAtWithEndsAt : startsAtFormatted}
        </Typography>
        <NameText
          color="primary"
          variant="h5"
          width={getNameTextWidth()}
          marginTop={0.5}
        >
          {name}
        </NameText>

        {isLoggedIn && (
          <EventAttendeeButtons
            event={event}
            itemMenu={
              <ItemMenu
                anchorEl={menuAnchorEl}
                buttonStyles={itemMenuButtonStyles}
                canDelete={canManageEvents}
                canUpdate={canManageEvents}
                deleteItem={handleDelete}
                deletePrompt={deletePrompt}
                editPath={editEventPath}
                setAnchorEl={setMenuAnchorEl}
                variant="ghost"
              />
            }
          />
        )}

        {!!(interestedCount + goingCount) && (
          <Typography color="text.secondary" gutterBottom>
            <Group sx={iconStyles} />
            {!!interestedCount && (
              <>
                {interestedCount} {t('events.labels.interested')}
              </>
            )}
            {!!interestedCount && !!goingCount && MIDDOT_WITH_SPACES}
            {!!goingCount && (
              <>
                {goingCount} {t('events.labels.going')}
              </>
            )}
          </Typography>
        )}

        {group && (
          <Typography color="text.secondary" gutterBottom>
            <Flag sx={iconStyles} />
            {t('events.labels.eventBy')}
            <Link href={groupEventsTabPath} sx={{ marginLeft: '0.4ch' }}>
              {group.name}
            </Link>
          </Typography>
        )}

        <Typography color="text.secondary" gutterBottom>
          <Person sx={iconStyles} />
          {t('events.labels.host')}:
          <Link href={hostPath} sx={{ marginLeft: '0.4ch' }}>
            {host.name}
          </Link>
        </Typography>

        {location && (
          <Typography color="text.secondary" gutterBottom>
            <Place sx={iconStyles} />
            {location}
          </Typography>
        )}

        {endsAt && (
          <Typography color="text.secondary" gutterBottom>
            <Timer sx={iconStyles} />
            {t('events.labels.duration', { duration })}
          </Typography>
        )}

        {online && (
          <Typography color="text.secondary">
            <Language sx={iconStyles} />
            {externalLink
              ? t('events.labels.onlineWithColon') + ' '
              : t('events.labels.onlineEvent')}
            {externalLink && (
              <ExternalLink href={externalLink}>{externalLink}</ExternalLink>
            )}
          </Typography>
        )}
      </CardContent>

      <Divider sx={{ marginX: '16px', marginBottom: 0.25 }} />

      <Tabs
        onChange={(_: any, value: number) => setTab(value)}
        textColor="inherit"
        value={tab}
      >
        <Tab
          label={t('events.tabs.about')}
          onClick={() => navigate(eventPagePath)}
        />
        <Tab
          label={t('events.tabs.discussion')}
          onClick={() => navigate(discussionTabPath)}
        />
      </Tabs>
    </Card>
  );
};

export default EventPageCard;
