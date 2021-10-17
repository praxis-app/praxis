import {
  CircularProgress,
  createStyles,
  makeStyles,
  Typography,
} from "@material-ui/core";
import Image from "material-ui-image";
import Link from "next/link";
import dayjs from "dayjs";

import { ResourcePaths } from "../../constants/common";
import { baseUrl, isHosting } from "../../utils/clientIndex";
import muiTheme from "../../styles/Shared/theme";
import EventItemMenu from "./ItemMenu";
import {
  useAttendeesByEventId,
  useCoverPhotoByEventId,
  useCurrentUser,
} from "../../hooks";
import AttendanceButtons from "./AttendanceButtons";

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      display: "flex",
      marginBottom: 12,
    },
    coverPhoto: {
      minWidth: 100,
      height: 100,
      marginRight: 12,
    },
    buttons: {
      display: "flex",
    },
  })
);

interface Props {
  event: ClientEvent;
  deleteEvent: (id: string) => void;
}

const Event = ({ event, deleteEvent }: Props) => {
  const currentUser = useCurrentUser();
  const { id, name, startsAt } = event;
  const [attendees, setAttendees, attendeesLoading] = useAttendeesByEventId(id);
  const [coverPhoto] = useCoverPhotoByEventId(id);
  const eventPageLink = `${ResourcePaths.Event}${id}`;
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Link href={eventPageLink}>
        <a className={classes.coverPhoto}>
          <Image
            src={baseUrl + coverPhoto?.path}
            color={muiTheme.palette.background.paper}
            imageStyle={{ borderRadius: 8 }}
            disableSpinner
            disableError
            cover
          />
        </a>
      </Link>

      <div>
        <Link href={eventPageLink}>
          <a>
            <Typography variant="overline">
              {dayjs(parseInt(startsAt)).format("ddd, MMM D, YYYY")}
            </Typography>
          </a>
        </Link>

        <Link href={eventPageLink}>
          <a>
            <Typography variant="h6" color="primary">
              {name}
            </Typography>
          </a>
        </Link>

        {currentUser && (
          <div className={classes.buttons}>
            {attendeesLoading ? (
              <CircularProgress size={10} />
            ) : (
              <AttendanceButtons
                event={event}
                attendees={attendees}
                setAttendees={setAttendees}
                isHosting={isHosting(attendees, currentUser)}
                hideGoing
              />
            )}

            <EventItemMenu
              event={event}
              deleteEvent={deleteEvent}
              isHosting={isHosting(attendees, currentUser)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Event;
