import { useEffect } from "react";
import Router, { useRouter } from "next/router";
import Link from "next/link";
import {
  Card,
  CardContent,
  CircularProgress,
  createStyles,
  Divider,
  LinearProgress,
  makeStyles,
  Tab,
  Tabs,
  Typography,
} from "@material-ui/core";
import {
  Flag as FlagIcon,
  Language as WebIcon,
  WatchLater as ClockIcon,
  SupervisorAccount as AttendeesIcon,
} from "@material-ui/icons";
import humanizeDuration from "humanize-duration";
import dayjs from "dayjs";

import { ResourcePaths, TAB_QUERY_PARAM } from "../../constants/common";
import { formatDateTime, isHosting, sameDay } from "../../utils/clientIndex";
import {
  useAttendeesByEventId,
  useCoverPhotoByEventId,
  useCurrentUser,
  useGroupById,
} from "../../hooks";
import Messages from "../../utils/messages";
import EventItemMenu from "./ItemMenu";
import CoverPhoto from "../Images/CoverPhoto";
import AttendanceButtons from "./AttendanceButtons";
import { AttendingStatus } from "../../constants/event";
import { GroupTabs } from "../Groups/PageHeader";

export const enum EventTabs {
  About = "about",
  Discussion = "discussion",
}

const useStyles = makeStyles(() =>
  createStyles({
    buttons: {
      display: "flex",
      marginTop: 12,
      marginBottom: 12,
    },
    buttonRoot: {
      marginRight: 10,
    },
    iconRoot: {
      marginBottom: -4,
      marginRight: 12,
    },
    buttonIconRoot: {
      marginRight: 4,
    },
    typographyRoot: {
      marginBottom: 6,
    },
    dividerRoot: {
      marginTop: 12,
      marginBottom: 0,
    },
  })
);

interface Props {
  event: ClientEvent;
  deleteEvent: (id: string) => void;
  setTab: (tab: number) => void;
  tab: number;
}

const EventPageHeader = ({ event, deleteEvent, tab, setTab }: Props) => {
  const { id, name, startsAt, endsAt, online, externalLink, groupId } = event;
  const [attendees, setAttendees, attendeesLoading] = useAttendeesByEventId(id);
  const [coverPhoto, _setCoverPhoto, coverPhotoLoading] =
    useCoverPhotoByEventId(id);
  const [group, _setGroup, groupLoading] = useGroupById(groupId);
  const currentUser = useCurrentUser();
  const { query } = useRouter();
  const classes = useStyles();
  const going = attendees.filter(
    (attendee) => attendee.status === AttendingStatus.Going
  );
  const interested = attendees.filter(
    (attendee) => attendee.status === AttendingStatus.Interested
  );
  const eventPagePath = `${ResourcePaths.Event}${id}`;
  const discussionTabPath = `${eventPagePath}${TAB_QUERY_PARAM}${EventTabs.Discussion}`;

  useEffect(() => {
    if (query.tab === EventTabs.Discussion) setTab(1);
  }, [query.tab]);

  const displayTime = (): string => {
    if (endsAt && sameDay(startsAt, endsAt))
      return (
        formatDateTime(startsAt, false) +
        dayjs(parseInt(endsAt)).format(" [-] h:mm a")
      );
    return formatDateTime(startsAt, false);
  };

  const displayDuration = (): string | null => {
    if (endsAt) {
      const difference = dayjs(parseInt(endsAt)).diff(
        dayjs(parseInt(startsAt))
      );
      return humanizeDuration(difference)
        .replace(/,/g, "")
        .replace(/hours|hour/g, Messages.time.hr())
        .replace(/minutes|minute/g, Messages.time.min());
    }
    return null;
  };

  const displayAttendees = () => {
    return `${
      going.length
        ? going.length + " " + Messages.events.attendance.going()
        : ""
    }${going.length && interested.length ? Messages.middotWithSpaces() : ""}${
      interested.length
        ? interested.length + " " + Messages.events.attendance.interested()
        : ""
    }`;
  };

  if (coverPhotoLoading || groupLoading)
    return (
      <Card>
        <LinearProgress />
      </Card>
    );

  return (
    <Card>
      <CoverPhoto path={coverPhoto?.path} />

      <CardContent style={{ paddingBottom: 0 }}>
        <Typography variant="overline">{displayTime()}</Typography>

        <Typography variant="h6" color="primary" style={{ marginBottom: 0 }}>
          {name}
        </Typography>

        {online && (
          <Typography className={classes.typographyRoot}>
            {Messages.events.online.onlineEvent()}
          </Typography>
        )}

        <div className={classes.buttons}>
          {attendeesLoading ? (
            <CircularProgress size={10} />
          ) : (
            <AttendanceButtons
              event={event}
              attendees={attendees}
              setAttendees={setAttendees}
              isHosting={isHosting(attendees, currentUser)}
            />
          )}

          {currentUser && (
            <EventItemMenu
              event={event}
              deleteEvent={deleteEvent}
              isHosting={isHosting(attendees, currentUser)}
            />
          )}
        </div>

        {endsAt && (
          <Typography className={classes.typographyRoot}>
            <ClockIcon fontSize="small" className={classes.iconRoot} />
            {displayDuration()}
          </Typography>
        )}

        {Boolean(going.length + interested.length) && (
          <Typography className={classes.typographyRoot}>
            <AttendeesIcon fontSize="small" className={classes.iconRoot} />
            {displayAttendees()}
          </Typography>
        )}

        {group && (
          <Typography className={classes.typographyRoot}>
            <FlagIcon fontSize="small" className={classes.iconRoot} />
            {Messages.events.by()}
            <Link
              href={`${ResourcePaths.Group}${group.name}${TAB_QUERY_PARAM}${GroupTabs.Events}`}
            >
              <a>{group.name}</a>
            </Link>
          </Typography>
        )}

        {online && externalLink && (
          <Typography className={classes.typographyRoot}>
            <WebIcon fontSize="small" className={classes.iconRoot} />
            {Messages.events.online.online() + ": "}
            <a target="_blank" rel="noopener noreferrer" href={externalLink}>
              {externalLink}
            </a>
          </Typography>
        )}

        <Divider className={classes.dividerRoot} />
      </CardContent>

      <Tabs
        value={tab}
        onChange={(_event: React.ChangeEvent<any>, newValue: number) =>
          setTab(newValue)
        }
        textColor="inherit"
      >
        <Tab
          label={Messages.events.tabs.about()}
          onClick={() => Router.push(eventPagePath)}
        />
        <Tab
          label={Messages.events.tabs.discussion()}
          onClick={() => Router.push(discussionTabPath)}
        />
      </Tabs>
    </Card>
  );
};

export default EventPageHeader;
