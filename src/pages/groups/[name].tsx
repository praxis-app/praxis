import { useState, useEffect } from "react";
import { useLazyQuery, useMutation, useReactiveVar } from "@apollo/client";
import Router, { useRouter } from "next/router";
import { Card, LinearProgress, Typography } from "@material-ui/core";

import Feed from "../../components/Shared/Feed";
import MotionsFormWithCard from "../../components/Motions/FormWithCard";
import ToggleForms from "../../components/Shared/ToggleForms";
import Pagination from "../../components/Shared/Pagination";
import { GROUP_FEED } from "../../apollo/client/queries";
import {
  DELETE_GROUP,
  DELETE_POST,
  DELETE_MOTION,
} from "../../apollo/client/mutations";
import { feedVar, paginationVar } from "../../apollo/client/localState";
import { ModelNames, NavigationPaths, TypeNames } from "../../constants/common";
import Messages from "../../utils/messages";
import { noCache } from "../../utils/apollo";
import {
  useCurrentUser,
  useGroupByName,
  useMembersByGroupId,
} from "../../hooks";
import { resetFeed } from "../../utils/items";
import GroupPageHeader from "../../components/Groups/PageHeader";
import AboutTab from "../../components/Groups/About";
import EventsTab from "../../components/Groups/EventsTab";

const Show = () => {
  const {
    query: { name },
  } = useRouter();
  const currentUser = useCurrentUser();
  const feed = useReactiveVar(feedVar);
  const { currentPage, pageSize } = useReactiveVar(paginationVar);
  const [tab, setTab] = useState(0);
  const [group, _, groupLoading] = useGroupByName(name);
  const [groupMembers] = useMembersByGroupId(group?.id);
  const [getFeedRes, feedRes] = useLazyQuery(GROUP_FEED, noCache);
  const [deleteGroup] = useMutation(DELETE_GROUP);
  const [deleteMotion] = useMutation(DELETE_MOTION);
  const [deletePost] = useMutation(DELETE_POST);

  useEffect(() => {
    if (name) {
      const itemType = tab === 1 ? ModelNames.Motion : "";

      feedVar({
        ...feed,
        loading: true,
      });

      getFeedRes({
        variables: {
          name,
          pageSize,
          currentPage,
          itemType,
        },
      });
    }
  }, [name, currentPage, pageSize, tab]);

  useEffect(() => {
    if (feedRes.data) {
      feedVar({
        items: feedRes.data.groupFeed.pagedItems,
        totalItems: feedRes.data.groupFeed.totalItems,
        loading: feedRes.loading,
      });
    }
  }, [feedRes.data]);

  useEffect(() => {
    return () => {
      resetFeed();
    };
  }, []);

  const deleteGroupHandler = async (groupId: string) => {
    await deleteGroup({
      variables: {
        id: groupId,
      },
    });
    Router.push(NavigationPaths.Groups);
  };

  const deletePostHandler = async (id: string) => {
    await deletePost({
      variables: {
        id,
      },
    });
    feedVar({
      ...feed,
      items: feed.items.filter(
        (item: ClientFeedItem) =>
          item.id !== id || item.__typename !== TypeNames.Post
      ),
      totalItems: feed.totalItems - 1,
    });
  };

  const deleteMotionHandler = async (id: string) => {
    await deleteMotion({
      variables: {
        id,
      },
    });
    feedVar({
      ...feed,
      items: feed.items.filter(
        (item: ClientFeedItem) =>
          item.id !== id || item.__typename !== TypeNames.Motion
      ),
      totalItems: feed.totalItems - 1,
    });
  };

  const inThisGroup = (): boolean => {
    if (!currentUser) return false;
    return Boolean(
      groupMembers.find((member) => member.userId === currentUser.id)
    );
  };

  if (groupLoading)
    return (
      <Card>
        <LinearProgress />
      </Card>
    );

  if (!group)
    return <Typography>{Messages.items.notFound(TypeNames.Group)}</Typography>;

  return (
    <>
      <GroupPageHeader
        group={group}
        deleteGroup={deleteGroupHandler}
        setTab={setTab}
        tab={tab}
      />

      {inThisGroup() && (
        <>
          {tab === 0 && <ToggleForms group={group} />}
          {tab === 1 && <MotionsFormWithCard group={group} withoutToggle />}
        </>
      )}

      {tab <= 1 && (
        <Pagination>
          <Feed
            deleteMotion={deleteMotionHandler}
            deletePost={deletePostHandler}
          />
        </Pagination>
      )}

      {tab === 2 && <EventsTab group={group} />}

      {tab === 3 && <AboutTab group={group} />}
    </>
  );
};

export default Show;
