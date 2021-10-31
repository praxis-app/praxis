import React, { Fragment, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  createStyles,
  Divider as MUIDivider,
  LinearProgress,
  Tab,
  Tabs,
  Typography,
  withStyles,
} from "@material-ui/core";

import Messages from "../../utils/messages";
import { JOINED_GROUP_EVENTS_BY_USER_ID } from "../../apollo/client/queries";
import { noCache } from "../../utils/clientIndex";
import { useLazyQuery, useMutation } from "@apollo/client";
import { useCurrentUser } from "../../hooks";
import { EventTimeFrames } from "../../constants/event";
import Event from "../../components/Events/Event";
import { DELETE_EVENT } from "../../apollo/client/mutations";
import NoEvents from "../../components/Events/NoEvents";

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

const Index = () => {
  const currentUser = useCurrentUser();
  const [tab, setTab] = useState(0);
  const [events, setEvents] = useState<ClientEvent[]>([]);
  const [deleteEvent] = useMutation(DELETE_EVENT);
  const [getEventsRes, eventsRes] = useLazyQuery(
    JOINED_GROUP_EVENTS_BY_USER_ID,
    noCache
  );

  useEffect(() => {
    if (currentUser?.id)
      getEventsRes({
        variables: {
          userId: currentUser.id,
          timeFrame: selectedTimeFrame(),
          online: tab === 2,
        },
      });
  }, [currentUser?.id, tab]);

  useEffect(() => {
    if (eventsRes.data) setEvents(eventsRes.data.joinedGroupEventsByUserId);
  }, [eventsRes.data]);

  const deleteEventHandler = async (id: string) => {
    await deleteEvent({
      variables: {
        id,
      },
    });
    setEvents(events.filter((event) => event.id !== id));
  };

  const selectedTimeFrame = (): EventTimeFrames => {
    switch (tab) {
      case 0:
      case 2:
        return EventTimeFrames.Future;
      case 1:
        return EventTimeFrames.ThisWeek;
      case 3:
        return EventTimeFrames.Past;
      default:
        return EventTimeFrames.All;
    }
  };

  const NoEventsMessage = () => {
    switch (tab) {
      case 0:
        return <NoEvents message={Messages.events.prompts.noUpcoming()} />;
      case 1:
        return <NoEvents message={Messages.events.prompts.noneThisWeek()} />;
      case 2:
        return <NoEvents message={Messages.events.prompts.noneOnline()} />;
      default:
        return <NoEvents message={Messages.events.prompts.noPast()} />;
    }
  };

  return (
    <>
      <Typography variant="h4" gutterBottom>
        {Messages.events.discover()}
      </Typography>

      <Card>
        <Tabs
          value={tab}
          onChange={(_event: React.ChangeEvent<any>, newValue: number) =>
            setTab(newValue)
          }
          textColor="inherit"
          centered
        >
          <Tab label={Messages.events.tabs.upcoming()} />
          <Tab label={Messages.events.tabs.thisWeek()} />
          <Tab label={Messages.events.online.online()} />
          <Tab label={Messages.events.tabs.past()} />
        </Tabs>
      </Card>

      <Card>
        {eventsRes.loading ? (
          <LinearProgress />
        ) : (
          <CardContent style={{ paddingBottom: 6 }}>
            {!events.length ? (
              <NoEventsMessage />
            ) : (
              events.map((event) => (
                <Fragment key={event.id}>
                  <Event event={event} deleteEvent={deleteEventHandler} />
                  <Divider />
                </Fragment>
              ))
            )}
          </CardContent>
        )}
      </Card>
    </>
  );
};

export default Index;
