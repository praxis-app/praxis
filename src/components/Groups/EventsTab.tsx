import { Fragment } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  createStyles,
  Divider as MUIDivider,
  LinearProgress,
  Typography,
  withStyles,
} from "@material-ui/core";

import Messages from "../../utils/messages";
import Event from "../Events/Event";
import { useEventsByGroupId, useHasPermissionByGroupId } from "../../hooks";
import { EventTimeFrames } from "../../constants/event";
import GhostButton from "../Shared/GhostButton";
import EventFormModal from "../Events/FormModal";
import { modalOpenVar } from "../../apollo/client/localState";
import { ModelNames, PageSizes } from "../../constants/common";
import { useMutation } from "@apollo/client";
import { DELETE_EVENT } from "../../apollo/client/mutations";
import { GroupPermissions } from "../../constants/role";
import NoEvents from "../Events/NoEvents";

const Divider = withStyles(() =>
  createStyles({
    root: {
      marginTop: 18,
      marginBottom: 18,

      "&:nth-last-child(1)": {
        display: "none",
      },
    },
  })
)(MUIDivider);

interface Props {
  group: ClientGroup;
}

const EventsTab = ({ group }: Props) => {
  const [futureEvents, setFutureEvents, futureEventsLoading] =
    useEventsByGroupId(group.id, EventTimeFrames.Future);
  const [pastEvents, setPastEvents, pastEventsLoading] = useEventsByGroupId(
    group.id,
    EventTimeFrames.Past
  );
  const [deleteEvent] = useMutation(DELETE_EVENT);
  const [canCreateEvents] = useHasPermissionByGroupId(
    GroupPermissions.CreateEvents,
    group.id
  );

  const deleteEventHandler = async (id: string) => {
    await deleteEvent({
      variables: {
        id,
      },
    });
    setFutureEvents(futureEvents.filter((event) => event.id !== id));
    setPastEvents(pastEvents.filter((event) => event.id !== id));
  };

  return (
    <>
      <Card>
        {futureEventsLoading || pastEventsLoading ? (
          <LinearProgress />
        ) : (
          <>
            <CardHeader
              title={
                <Typography variant="h6">
                  {Messages.events.timeFrames.future()}
                </Typography>
              }
              action={
                canCreateEvents && (
                  <GhostButton
                    onClick={() => modalOpenVar(ModelNames.Event)}
                    style={{ marginTop: 6, marginRight: 3 }}
                  >
                    {Messages.events.actions.create()}
                  </GhostButton>
                )
              }
            />
            <CardContent>
              {futureEvents.slice(0, PageSizes.Min).map((event) => (
                <Fragment key={event.id}>
                  <Event event={event} deleteEvent={deleteEventHandler} />
                  <Divider />
                </Fragment>
              ))}

              {!futureEvents.length && (
                <NoEvents message={Messages.events.prompts.noUpcoming()} />
              )}
            </CardContent>
          </>
        )}
      </Card>

      {Boolean(pastEvents.length) && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {Messages.events.timeFrames.past()}
            </Typography>

            {pastEvents.slice(0, PageSizes.Min).map((event) => (
              <Fragment key={event.id}>
                <Event event={event} deleteEvent={deleteEventHandler} />
                <Divider />
              </Fragment>
            ))}
          </CardContent>
        </Card>
      )}

      <EventFormModal group={group} />
    </>
  );
};

export default EventsTab;
