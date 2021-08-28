import { useState, useEffect } from "react";
import { useLazyQuery, useMutation, useReactiveVar } from "@apollo/client";
import Router, { useRouter } from "next/router";
import { Tab, Tabs, Card, CircularProgress } from "@material-ui/core";

import Group from "../../components/Groups/Group";
import Feed from "../../components/Shared/Feed";
import PostsForm from "../../components/Posts/Form";
import MotionsForm from "../../components/Motions/Form";
import ToggleForms from "../../components/Groups/ToggleForms";
import Pagination from "../../components/Shared/Pagination";
import { GROUP_BY_NAME, GROUP_FEED } from "../../apollo/client/queries";
import {
  DELETE_GROUP,
  DELETE_POST,
  DELETE_MOTION,
} from "../../apollo/client/mutations";
import { feedVar, paginationVar } from "../../apollo/client/localState";
import { ModelNames, TypeNames } from "../../constants/common";
import Messages from "../../utils/messages";
import { noCache } from "../../utils/apollo";
import { useCurrentUser, useMembersByGroupId } from "../../hooks";
import { resetFeed } from "../../utils/items";

const Show = () => {
  const {
    query: { name },
  } = useRouter();
  const currentUser = useCurrentUser();
  const feed = useReactiveVar(feedVar);
  const { currentPage, pageSize } = useReactiveVar(paginationVar);
  const [group, setGroup] = useState<Group>();
  const [tab, setTab] = useState<number>(0);
  const [groupMembers] = useMembersByGroupId(group?.id);
  const [getGroupRes, groupRes] = useLazyQuery(GROUP_BY_NAME, noCache);
  const [getFeedRes, feedRes] = useLazyQuery(GROUP_FEED, noCache);
  const [deleteGroup] = useMutation(DELETE_GROUP);
  const [deleteMotion] = useMutation(DELETE_MOTION);
  const [deletePost] = useMutation(DELETE_POST);

  useEffect(() => {
    if (name) {
      getGroupRes({
        variables: { name },
      });
    }
  }, [name]);

  useEffect(() => {
    if (groupRes.data) setGroup(groupRes.data.groupByName);
  }, [groupRes.data]);

  useEffect(() => {
    if (name) {
      let itemType = "";
      if (tab === 1) itemType = ModelNames.Motion;
      else if (tab === 2) itemType = ModelNames.Post;

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
    Router.push("/groups");
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
        (item: FeedItem) => item.id !== id || item.__typename !== TypeNames.Post
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
        (item: FeedItem) =>
          item.id !== id || item.__typename !== TypeNames.Motion
      ),
      totalItems: feed.totalItems - 1,
    });
  };

  const inThisGroup = (): boolean => {
    if (!currentUser) return false;
    return !!groupMembers.find((member) => member.userId === currentUser.id);
  };

  if (group)
    return (
      <>
        <Group group={group} deleteGroup={deleteGroupHandler} />

        <Card>
          <Tabs
            value={tab}
            onChange={(_event: React.ChangeEvent<any>, newValue: number) =>
              setTab(newValue)
            }
            textColor="inherit"
            centered
          >
            <Tab label={Messages.groups.tabs.all()} />
            <Tab label={Messages.groups.tabs.motions()} />
            <Tab label={Messages.groups.tabs.posts()} />
          </Tabs>
        </Card>

        {inThisGroup() && (
          <>
            {tab === 0 && <ToggleForms group={group} />}
            {tab === 1 && <MotionsForm group={group} />}
            {tab === 2 && <PostsForm group={group} />}
          </>
        )}

        <Pagination>
          <Feed
            deleteMotion={deleteMotionHandler}
            deletePost={deletePostHandler}
          />
        </Pagination>
      </>
    );

  return <CircularProgress />;
};

export default Show;
