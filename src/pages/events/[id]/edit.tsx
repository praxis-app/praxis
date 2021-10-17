import { useEffect } from "react";
import { useRouter } from "next/router";
import {
  Card,
  CardContent,
  CircularProgress,
  Typography,
} from "@material-ui/core";

import {
  ResourcePaths,
  TAB_QUERY_PARAM,
  TypeNames,
} from "../../../constants/common";
import Messages from "../../../utils/messages";
import {
  useAttendeesByEventId,
  useCurrentUser,
  useEventById,
  useGroupById,
} from "../../../hooks";
import { breadcrumbsVar } from "../../../apollo/client/localState";
import EventForm from "../../../components/Events/Form";
import { GroupTabs } from "../../../components/Groups/PageHeader";
import { isHosting } from "../../../utils/event";

const Show = () => {
  const { query } = useRouter();
  const currentUser = useCurrentUser();
  const [event, _setEvent, eventLoading] = useEventById(query.id);
  const [attendees, _setAttendees, attendeesLoading] = useAttendeesByEventId(
    event?.id
  );
  const [group, _setGroup, groupLoading] = useGroupById(event?.groupId);
  const canEdit = isHosting(attendees, currentUser);

  useEffect(() => {
    if (canEdit && event && group)
      breadcrumbsVar([
        {
          label: group.name,
          href: `${ResourcePaths.Group}${group.name}${TAB_QUERY_PARAM}${GroupTabs.Events}`,
        },
        {
          label: Messages.events.breadcrumbs.event(),
          href: `${ResourcePaths.Event}${event.id}`,
        },
        {
          label: Messages.events.breadcrumbs.editEvent(),
        },
      ]);
    else breadcrumbsVar([]);

    return () => {
      breadcrumbsVar([]);
    };
  }, [event, group, attendees, currentUser]);

  if (eventLoading || groupLoading || attendeesLoading)
    return <CircularProgress />;

  if (!event)
    return <Typography>{Messages.items.notFound(TypeNames.Event)}</Typography>;

  if (!canEdit)
    return <Typography>{Messages.users.permissionDenied()}</Typography>;

  return (
    <Card>
      <CardContent>
        <EventForm event={event} isEditing />
      </CardContent>
    </Card>
  );
};

export default Show;
