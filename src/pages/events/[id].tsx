import { useState } from "react";
import Router, { useRouter } from "next/router";
import { useMutation } from "@apollo/client";
import { CircularProgress, Typography } from "@material-ui/core";

import { DELETE_EVENT } from "../../apollo/client/mutations";
import {
  NavigationPaths,
  ResourcePaths,
  TAB_QUERY_PARAM,
  TypeNames,
} from "../../constants/common";
import PageHeader from "../../components/Events/PageHeader";
import Messages from "../../utils/messages";
import { useEventById, useGroupById } from "../../hooks";
import { GroupTabs } from "../../components/Groups/PageHeader";
import AboutTab from "../../components/Events/AboutTab";
import DiscussionTab from "../../components/Events/DiscussionTab";

const Show = () => {
  const { query } = useRouter();
  const [event, _setEvent, eventLoading] = useEventById(query.id);
  const [group, _setGroup, groupLoading] = useGroupById(event?.groupId);
  const [deleteEvent] = useMutation(DELETE_EVENT);
  const [tab, setTab] = useState(0);

  const deleteEventHandler = async (id: string) => {
    await deleteEvent({
      variables: {
        id,
      },
    });
    if (group)
      Router.push(
        `${ResourcePaths.Group}${group.name}${TAB_QUERY_PARAM}${GroupTabs.Events}`
      );
    else Router.push(NavigationPaths.Home);
  };

  if (eventLoading || groupLoading) return <CircularProgress />;
  if (!event)
    return <Typography>{Messages.items.notFound(TypeNames.Event)}</Typography>;

  return (
    <>
      <PageHeader
        event={event}
        deleteEvent={deleteEventHandler}
        setTab={setTab}
        tab={tab}
      />

      {tab === 0 && <AboutTab event={event} />}
      {tab === 1 && <DiscussionTab event={event} />}
    </>
  );
};

export default Show;
