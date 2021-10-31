import { useMutation } from "@apollo/client";
import { createStyles, makeStyles } from "@material-ui/core";
import { EventAvailable, Star, CheckCircle, Help } from "@material-ui/icons";
import clsx from "clsx";

import { useCurrentUser } from "../../hooks";
import Messages from "../../utils/messages";
import GhostButton from "../Shared/GhostButton";
import PrimaryActionButton from "../Shared/PrimaryActionButton";
import {
  CREATE_EVENT_ATTENDEE,
  DELETE_EVENT_ATTENDEE,
} from "../../apollo/client/mutations/eventAttendee";
import { AttendingStatus } from "../../constants/event";

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      display: "flex",
    },
    buttonRoot: {
      marginRight: 10,
    },
    isAttendingButtonRoot: {
      color: "#E0E5F7",
      backgroundColor: "#596BAA",
      "&:hover": {
        backgroundColor: "#4C5B91",
      },
      "&:active": {
        backgroundColor: "#4666A8",
      },
      boxShadow: "none",
    },
    buttonIconRoot: {
      marginRight: 4,
    },
  })
);

interface Props {
  event: ClientEvent;
  attendees: ClientEventAttendee[];
  setAttendees: (attendees: ClientEventAttendee[]) => void;
  isHosting: boolean;
  hideGoing?: boolean;
}

const AttendanceButtons = ({
  event: { id: eventId },
  attendees,
  setAttendees,
  isHosting,
  hideGoing,
}: Props) => {
  const currentUser = useCurrentUser();
  const [createEventAttendee, { loading: createEventAttendeeLoading }] =
    useMutation(CREATE_EVENT_ATTENDEE);
  const [deleteEventAttendee, { loading: deleteEventAttendeeLoading }] =
    useMutation(DELETE_EVENT_ATTENDEE);
  const classes = useStyles();

  const handleButtonClick = async (status: AttendingStatus) => {
    let newAttendees = attendees;
    if (alreadyGoingOrInterested()) {
      await deleteEventAttendee({
        variables: {
          id: alreadyGoingOrInterested()?.id,
        },
      });
      newAttendees = attendees.filter(
        (attendee) => attendee.userId !== currentUser?.id
      );
    }
    if (
      (alreadyGoingOrInterested() &&
        alreadyGoingOrInterested()?.status !== status) ||
      !alreadyGoingOrInterested()
    ) {
      const { data } = await createEventAttendee({
        variables: {
          userId: currentUser?.id,
          eventId,
          status,
        },
      });
      newAttendees = [...newAttendees, data.createEventAttendee.eventAttendee];
    }
    setAttendees(newAttendees);
  };

  const alreadyGoingOrInterested = (): ClientEventAttendee | undefined => {
    if (!currentUser) return undefined;
    return attendees.find((attendee) => attendee.userId === currentUser.id);
  };

  const isDisabled =
    createEventAttendeeLoading || deleteEventAttendeeLoading || isHosting;
  const isGoing = alreadyGoingOrInterested()?.status === AttendingStatus.Going;
  const isInterested =
    alreadyGoingOrInterested()?.status === AttendingStatus.Interested;
  const GoingIcon = isGoing ? EventAvailable : Help;
  const InterestedIcon = isInterested ? CheckCircle : Star;
  const GoingButton = isInterested ? GhostButton : PrimaryActionButton;
  const InterestedButton = isInterested ? PrimaryActionButton : GhostButton;

  return (
    <div className={classes.root}>
      {!hideGoing && (
        <GoingButton
          onClick={() => handleButtonClick(AttendingStatus.Going)}
          disabled={isDisabled}
          className={clsx(classes.buttonRoot, {
            [classes.isAttendingButtonRoot]: isGoing,
          })}
        >
          <GoingIcon fontSize="small" className={classes.buttonIconRoot} />
          {Messages.events.attendance.going()}
        </GoingButton>
      )}

      <InterestedButton
        onClick={() => handleButtonClick(AttendingStatus.Interested)}
        disabled={isDisabled}
        className={clsx(classes.buttonRoot, {
          [classes.isAttendingButtonRoot]: isInterested,
        })}
      >
        <InterestedIcon fontSize="small" className={classes.buttonIconRoot} />
        {Messages.events.attendance.interested()}
      </InterestedButton>
    </div>
  );
};

export default AttendanceButtons;
